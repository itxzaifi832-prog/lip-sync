import os
import uuid
import shutil
from pathlib import Path

# Define temp directory relative to this file
# structure: backend/utils/file_handler.py -> backend/temp
BASE_DIR = Path(__file__).resolve().parent.parent
TEMP_DIR = BASE_DIR / "temp"

def init_temp_dir():
    """Ensure the temp directory exists."""
    os.makedirs(TEMP_DIR, exist_ok=True)

def get_temp_file_path(extension: str) -> Path:
    """Generate a unique path in the temp directory."""
    init_temp_dir()
    if not extension.startswith("."):
        extension = f".{extension}"
    unique_name = f"{uuid.uuid4()}{extension}"
    return TEMP_DIR / unique_name

def save_upload_file(file_content: bytes, filename: str) -> Path:
    """Save bytes to a temp file, preserving extension from filename if possible."""
    init_temp_dir()
    ext = os.path.splitext(filename)[1]
    if not ext:
        ext = ".tmp"
    
    path = get_temp_file_path(ext)
    with open(path, "wb") as f:
        f.write(file_content)
    return path

async def save_upload_file_async(upload_file) -> Path:
    """Save an UploadFile to disk."""
    init_temp_dir()
    ext = os.path.splitext(upload_file.filename)[1]
    path = get_temp_file_path(ext)
    
    with open(path, "wb") as f:
        content = await upload_file.read()
        f.write(content)
        
    return path

def cleanup_file(path: Path):
    """Remove a specific file."""
    if path and os.path.exists(path):
        try:
            os.remove(path)
        except Exception as e:
            print(f"Error cleaning up file {path}: {e}")

def cleanup_temp_dir():
    """Clean up entire temp directory."""
    if os.path.exists(TEMP_DIR):
        try:
            shutil.rmtree(TEMP_DIR)
            init_temp_dir()
        except Exception as e:
            print(f"Error cleaning temp dir: {e}")
