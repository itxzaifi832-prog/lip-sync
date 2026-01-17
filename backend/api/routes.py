from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import FileResponse, JSONResponse
from services.tts_service import TTSService
from services.lipsync_service import LipSyncService
from utils.file_handler import save_upload_file_async, cleanup_file
from utils.validators import validate_image_file, validate_text
import os
import shutil

router = APIRouter()

@router.get("/health")
async def health_check():
    return {"status": "healthy"}

@router.post("/generate-lipsync")
async def generate_lipsync(
    text: str = Form(...),
    image: UploadFile = File(...),
    background_tasks: BackgroundTasks = BackgroundTasks()
):
    # Validation
    validate_text(text)
    validate_image_file(image.filename, 0)

    temp_files = []
    
    try:
        # 1. Save Image
        image_path = await save_upload_file_async(image)
        temp_files.append(image_path)
        
        # 2. Generate Audio
        audio_path = await TTSService.generate_audio(text)
        temp_files.append(audio_path)
        
        # 3. Generate Lip-Sync Video
        video_path = await LipSyncService.generate(image_path, audio_path)
        temp_files.append(video_path)
        
        # Schedule cleanup of temporary files after response
        for f in temp_files:
            background_tasks.add_task(cleanup_file, f)
        
        # Return the generated video
        return FileResponse(
            video_path, 
            media_type="video/mp4", 
            filename="lipsync_output.mp4"
        )

    except Exception as e:
        # Clean up on error
        for f in temp_files:
            cleanup_file(f)
        raise HTTPException(status_code=500, detail=str(e))
