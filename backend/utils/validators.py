import os
from fastapi import HTTPException

ALLOWED_IMAGE_EXTENSIONS = {'.jpg', '.jpeg', '.png'}
MAX_IMAGE_SIZE = 5 * 1024 * 1024  # 5MB

def validate_image_file(filename: str, size: int):
    ext = os.path.splitext(filename)[1].lower()
    if ext not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Invalid image format. Only JPG and PNG are allowed.")
    
    if size > MAX_IMAGE_SIZE:
        raise HTTPException(status_code=400, detail="Image size exceeds 5MB limit.")

def validate_text(text: str):
    if not text or len(text.strip()) == 0:
        raise HTTPException(status_code=400, detail="Text cannot be empty.")
    if len(text) > 1000:
        raise HTTPException(status_code=400, detail="Text is too long (max 1000 characters).")
