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

class LipSyncService:
    device = 'cpu'  # Force CPU-only
    model = None
    model_path = None
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
                # If it's a ScriptModule or similar, try to get state_dict()
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
    
    @staticmethod
    def _face_detect(image_path: Path, pads=[0, 10, 0, 0]):
        """Detect face in the image and return cropped face region"""
        # For a single image, we'll use a simple face detection or just use the whole image
        # Simplified version: use the full image with padding
        img = cv2.imread(str(image_path))
        
        # For single image inference, we'll use a simple center crop approach
        # In production, you should use face_alignment library for proper face detection
        h, w = img.shape[:2]
        
        # Simple center crop (assumes face is centered)
        # You can enhance this with actual face detection using face_alignment
        pady1, pady2, padx1, padx2 = pads
        
        # Use the full image for now (simplified)
        y1, y2 = 0, h
        x1, x2 = 0, w
        
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
        face, coords = frames[0]
        
        for i, m in enumerate(mels):
            frame_to_save = face.copy()
            face_resized = cv2.resize(face, (img_size, img_size))
            
            img_batch.append(face_resized)
            mel_batch.append(m)
            frame_batch.append(frame_to_save)
            coords_batch.append(coords)
            
            if len(img_batch) >= batch_size:
                img_batch_np, mel_batch_np = np.asarray(img_batch), np.asarray(mel_batch)
                
                # Mask the lower half
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
        
        # Load model
        model = cls._load_model(model_checkpoint)
        
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
        
        # Load and process image
        print("Processing image...")
        full_frame, coords = cls._face_detect(image_path)
        frames = [(full_frame, coords)]
        
        # Prepare output video writer
        frame_h, frame_w = full_frame.shape[:-1]
        temp_video_path = get_temp_file_path(".avi")
        out = cv2.VideoWriter(str(temp_video_path), cv2.VideoWriter_fourcc(*'DIVX'), fps, (frame_w, frame_h))
        
        # Generate lip-synced frames
        print("Generating lip-synced video...")
        batch_size = 16  # Reduced from 128 to prevent bad allocation/OOM on CPU

        gen = cls._datagen(frames, mel_chunks, cls.img_size, batch_size)
        
        for img_batch, mel_batch, frame_batch, coords_batch in gen:
            img_batch = torch.FloatTensor(np.transpose(img_batch, (0, 3, 1, 2))).to(cls.device)
            mel_batch = torch.FloatTensor(np.transpose(mel_batch, (0, 3, 1, 2))).to(cls.device)
            
            with torch.no_grad():
                pred = model(mel_batch, img_batch)
            
            pred = pred.cpu().numpy().transpose(0, 2, 3, 1) * 255.
            
            for p, f, c in zip(pred, frame_batch, coords_batch):
                y1, y2, x1, x2 = c
                p = cv2.resize(p.astype(np.uint8), (x2 - x1, y2 - y1))
                f[y1:y2, x1:x2] = p
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
