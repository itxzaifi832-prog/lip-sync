import asyncio
import os
import cv2
import numpy as np
import subprocess
import torch
from pathlib import Path
from utils.file_handler import get_temp_file_path
from wav2lip.models import Wav2Lip
from wav2lip import audio as wav2lip_audio


# GFPGAN import
from gfpgan import GFPGANer

class LipSyncService:
    device = 'cpu'  # Force CPU-only
    model = None
    model_path = None
    face_detector = None
    restorer = None
    mel_step_size = 16
    img_size = 96
    
    @classmethod
    def _load_model(cls, checkpoint_path: Path):
        """Load the Wav2Lip model from checkpoint"""
        if cls.model is None or cls.model_path != str(checkpoint_path):
            print(f"Loading Wav2Lip model from: {checkpoint_path}")
            cls.model = Wav2Lip()
            # PyTorch 2.6+ requires weights_only=False for TorchScript archives
            checkpoint = torch.load(
                checkpoint_path, 
                map_location=cls.device,
                weights_only=False
            )
            
            # Handle state dict
            if isinstance(checkpoint, dict):
                s = checkpoint.get("state_dict", checkpoint)
            else:
                s = checkpoint.state_dict()

            new_s = {}
            for k, v in s.items():
                new_s[k.replace('module.', '')] = v
            
            cls.model.load_state_dict(new_s)
            cls.model = cls.model.to(cls.device)
            cls.model.eval()
            cls.model_path = str(checkpoint_path)
            print("Wav2Lip model loaded successfully")
        
        return cls.model
    
    @classmethod
    def _load_face_detector(cls):
        """Load OpenCV DNN Face Detector"""
        if cls.face_detector is None:
            model_dir = Path("models")
            prototxt = model_dir / "deploy.prototxt"
            model = model_dir / "res10_300x300_ssd_iter_140000.caffemodel"
            
            if not prototxt.exists() or not model.exists():
                raise FileNotFoundError(
                    "OpenCV Face Detection models not found. "
                    "Please ensure 'deploy.prototxt' and 'res10_300x300_ssd_iter_140000.caffemodel' "
                    "are in the backend/models directory."
                )
            
            print("Loading OpenCV DNN Face Detector...")
            cls.face_detector = cv2.dnn.readNetFromCaffe(str(prototxt), str(model))
        
        return cls.face_detector

    @classmethod
    def _load_restorer(cls):
        """Load GFPGAN Restorer"""
        if cls.restorer is None:
            model_path = Path("models/GFPGANv1.4.pth")
            if not model_path.exists():
                raise FileNotFoundError(
                    "GFPGAN model not found. Please ensure 'GFPGANv1.4.pth' is in backend/models/"
                )
            
            print("Loading GFPGAN Restorer...")
            # Initialize the restorer
            # upsclae=1 means we don't upscale the whole image, we just restore the face
            # bg_upsampler=None to keep it faster on CPU
            cls.restorer = GFPGANer(
                model_path=str(model_path),
                upscale=1,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=None,
                device=cls.device
            )
        return cls.restorer

    @staticmethod
    def _get_smoothened_boxes(boxes, T=5):
        """Smooth face detection boxes over time"""
        for i in range(len(boxes)):
            if i + T > len(boxes):
                window = boxes[len(boxes) - T:]
            else:
                window = boxes[i : i + T]
            boxes[i] = np.mean(window, axis=0)
        return boxes
    
    @classmethod
    def _face_detect(cls, image_path: Path):
        """
        Detect face using OpenCV DNN and return cropped face region and coordinates.
        Returns: (full_image, (y1, y2, x1, x2))
        """
        img = cv2.imread(str(image_path))
        if img is None:
            raise ValueError(f"Could not open image: {image_path}")
            
        h, w = img.shape[:2]
        
        # Load detector
        net = cls._load_face_detector()
        
        # Predict
        blob = cv2.dnn.blobFromImage(cv2.resize(img, (300, 300)), 1.0, (300, 300), (104.0, 177.0, 123.0))
        net.setInput(blob)
        detections = net.forward()
        
        # Iterate over detections to find the best face
        best_box = None
        max_conf = 0
        
        for i in range(detections.shape[2]):
            confidence = detections[0, 0, i, 2]
            
            if confidence > 0.5:
                box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])
                (startX, startY, endX, endY) = box.astype("int")
                
                if confidence > max_conf:
                    max_conf = confidence
                    best_box = (startX, startY, endX, endY)
        
        if best_box is None:
            print("No face detected by OpenCV DNN! Processing entire image.")
            return img, (0, h, 0, w)
            
        x1, y1, x2, y2 = best_box
        w_face = x2 - x1
        h_face = y2 - y1
        
        # Expansion logic (same as before)
        # 1. find center
        cx = x1 + w_face // 2
        cy = y1 + h_face // 2
        
        # 2. determine larger side
        max_side = max(w_face, h_face)
        
        # 3. Apply expansion factor
        scale = 1.3
        new_side = int(max_side * scale)
        
        # 4. recalculate coords
        x1 = cx - new_side // 2
        x2 = cx + new_side // 2
        y1 = cy - new_side // 2
        y2 = cy + new_side // 2
        
        # 5. Handle boundaries
        x1 = max(0, x1)
        y1 = max(0, y1)
        x2 = min(w, x2)
        y2 = min(h, y2)
        
        return img, (y1, y2, x1, x2)
    
    @staticmethod
    def _prepare_image_batch(face, img_size=96):
        """Prepare the face image for model input"""
        face = cv2.resize(face, (img_size, img_size))
        return face
    
    @staticmethod
    def _datagen(frames, mels, img_size=96, batch_size=128):
        """Generate batches of data for inference"""
        img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []
        
        # For static image (single frame)
        full_frame, coords = frames[0]
        y1, y2, x1, x2 = coords
        
        # Crop the face for processing
        # Need to ensure coordinates are valid slices
        face = full_frame[y1:y2, x1:x2]
        
        if face.size == 0:
             # Fallback if crop failed
             face = full_frame
             coords = (0, full_frame.shape[0], 0, full_frame.shape[1])
        
        for i, m in enumerate(mels):
            # We save the full frame to paste back onto later
            frame_to_save = full_frame.copy()
            
            # Resize cropped face for model
            try:
                face_resized = cv2.resize(face, (img_size, img_size))
            except Exception as e:
                print(f"Resize failed: {e}. Using full frame.")
                face_resized = cv2.resize(full_frame, (img_size, img_size))
            
            img_batch.append(face_resized)
            mel_batch.append(m)
            frame_batch.append(frame_to_save)
            coords_batch.append(coords)
            
            if len(img_batch) >= batch_size:
                img_batch_np, mel_batch_np = np.asarray(img_batch), np.asarray(mel_batch)
                
                # Mask the lower half of the face input
                img_masked = img_batch_np.copy()
                img_masked[:, img_size//2:] = 0
                
                img_batch_np = np.concatenate((img_masked, img_batch_np), axis=3) / 255.
                mel_batch_np = np.reshape(mel_batch_np, [len(mel_batch_np), mel_batch_np.shape[1], mel_batch_np.shape[2], 1])
                
                yield img_batch_np, mel_batch_np, frame_batch, coords_batch
                img_batch, mel_batch, frame_batch, coords_batch = [], [], [], []
        
        if len(img_batch) > 0:
            img_batch_np, mel_batch_np = np.asarray(img_batch), np.asarray(mel_batch)
            
            img_masked = img_batch_np.copy()
            img_masked[:, img_size//2:] = 0
            
            img_batch_np = np.concatenate((img_masked, img_batch_np), axis=3) / 255.
            mel_batch_np = np.reshape(mel_batch_np, [len(mel_batch_np), mel_batch_np.shape[1], mel_batch_np.shape[2], 1])
            
            yield img_batch_np, mel_batch_np, frame_batch, coords_batch
    
    @classmethod
    async def generate(cls, image_path: Path, audio_path: Path, fps: float = 25.) -> Path:
        """
        Generates a lip-synced video from an image and audio.
        Returns the path to the generated video.
        """
        output_path = get_temp_file_path(".mp4")
        
        # Check if model file exists
        model_checkpoint = Path("models/wav2lip.pt")
        if not model_checkpoint.exists():
            model_checkpoint = Path("models/wav2lip.pth")
        
        if not model_checkpoint.exists():
            raise FileNotFoundError(
                "Wav2Lip model not found. Please download wav2lip.pth or wav2lip.pt "
                "and place it in the backend/models/ directory"
            )
        
        # Run inference in executor to avoid blocking
        loop = asyncio.get_event_loop()
        await loop.run_in_executor(
            None, 
            cls._run_inference,
            image_path,
            audio_path,
            output_path,
            model_checkpoint,
            fps
        )
        
        return output_path
    
    @classmethod
    def _run_inference(cls, image_path: Path, audio_path: Path, output_path: Path, model_checkpoint: Path, fps: float):
        """Run the Wav2Lip inference (synchronous)"""
        print("Starting Wav2Lip inference...")
        
        # Load models
        model = cls._load_model(model_checkpoint)
        restorer = cls._load_restorer() # Load GFPGAN
        
        # Load audio and convert to mel spectrogram
        print("Processing audio...")
        wav = wav2lip_audio.load_wav(str(audio_path), 16000)
        mel = wav2lip_audio.melspectrogram(wav)
        
        if np.isnan(mel.reshape(-1)).sum() > 0:
            raise ValueError('Mel spectrogram contains NaN values')
        
        # Create mel chunks
        mel_chunks = []
        mel_idx_multiplier = 80. / fps
        i = 0
        while True:
            start_idx = int(i * mel_idx_multiplier)
            if start_idx + cls.mel_step_size > len(mel[0]):
                mel_chunks.append(mel[:, len(mel[0]) - cls.mel_step_size:])
                break
            mel_chunks.append(mel[:, start_idx : start_idx + cls.mel_step_size])
            i += 1
        
        print(f"Number of mel chunks: {len(mel_chunks)}")
        
        # Load and process image (High Res)
        print("Processing image for face detection...")
        full_frame, coords = cls._face_detect(image_path)
        
        # frames is updated to hold (full_frame, coords)
        frames = [(full_frame, coords)]
        
        # Prepare output video writer using ORIGINAL dimensions
        frame_h, frame_w = full_frame.shape[:-1]
        temp_video_path = get_temp_file_path(".avi")
        out = cv2.VideoWriter(str(temp_video_path), cv2.VideoWriter_fourcc(*'DIVX'), fps, (frame_w, frame_h))
        
        # Generate lip-synced frames
        print("Generating lip-synced video...")
        batch_size = 16  # Reduced from 128 to prevent bad allocation/OOM on CPU

        gen = cls._datagen(frames, mel_chunks, cls.img_size, batch_size)
        
        for img_batch, mel_batch, frame_batch, coords_batch in gen:
            # Move to device
            img_batch = torch.FloatTensor(np.transpose(img_batch, (0, 3, 1, 2))).to(cls.device)
            mel_batch = torch.FloatTensor(np.transpose(mel_batch, (0, 3, 1, 2))).to(cls.device)
            
            with torch.no_grad():
                pred = model(mel_batch, img_batch)
            
            # Convert prediction back to numpy
            pred = pred.cpu().numpy().transpose(0, 2, 3, 1) * 255.
            
            for p, f, c in zip(pred, frame_batch, coords_batch):
                y1, y2, x1, x2 = c
                
                # p is the 96x96 face prediction from Wav2Lip
                p = p.astype(np.uint8)
                
                # --- GFPGAN Restoration ---
                # Enhance the face using GFPGAN
                # restorer.enhance takes the cropped face
                # returns: cropped_face, restored_face, restored_img
                # We only need restored_face
                try:
                    # restored_faces is a LIST of detected faces in the image.
                    # Since we are passing a single face crop, we take the first one.
                    _, restored_faces, _ = restorer.enhance(
                        p, 
                        has_aligned=False, 
                        only_center_face=False, 
                        paste_back=False
                    )
                    
                    if restored_faces is not None and len(restored_faces) > 0:
                        p = restored_faces[0]
                except Exception as e:
                    print(f"GFPGAN restoration failed for a frame: {e}")
                
                # --- End GFPGAN ---
                
                # Resize the (now restored) face back to the original face slot size
                p = cv2.resize(p, (x2 - x1, y2 - y1), interpolation=cv2.INTER_LANCZOS4)
                
                # Paste the lip-synced face back onto the full frame
                f[y1:y2, x1:x2] = p
                
                # Write the full resolution frame
                out.write(f)
        
        out.release()
        
        # Combine audio and video using ffmpeg
        print("Combining audio and video...")
        command = f'ffmpeg -y -i "{audio_path}" -i "{temp_video_path}" -strict -2 -q:v 1 "{output_path}"'
        ret_code = subprocess.call(command, shell=True)
        
        if ret_code != 0:
            # Check if output file exists just in case, but likely failed
            raise RuntimeError("FFmpeg failed to combine audio and video. Please ensure FFmpeg is installed and added to your system PATH.")

        # Clean up temp video
        if os.path.exists(temp_video_path):
            os.remove(temp_video_path)
        
        if not output_path.exists():
             raise FileNotFoundError(f"Output file was not generated at {output_path}")

        print(f"Lip-sync video generated: {output_path}")
        return output_path
