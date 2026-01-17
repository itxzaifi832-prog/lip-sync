# Lip-Sync Web App Setup Guide

## 1. Prerequisites
- Python 3.10+
- Node.js & npm
- Git

## 2. Model Setup (CRITICAL)
You must manually download these files and place them in `backend/models/`:

1. **Wav2Lip Checkpoint**:
   - Download `wav2lip.pth` from [Wav2Lip Release](https://github.com/Rudrabha/Wav2Lip/releases/download/v1/wav2lip.pth) 
   - OR `wav2lip_gan.pth` for better visual quality.
   - Save to `backend/models/wav2lip.pth`.

2. **Face Detection Model**:
   - Download `s3fd.pth`.
   - Save to `backend/models/s3fd.pth`.

## 3. Backend Setup
1. Navigate to backend: `cd backend`
2. Install dependencies:
   ```bash
   poetry install
   ```
   *Note: This includes a CPU-optimized version of PyTorch.*

3. Run the server:
   ```bash
   poetry run uvicorn main:app --reload
   ```
   The API will start at `http://localhost:8000`.

## 4. Frontend Setup
1. Navigate to frontend: `cd frontend`
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
   The app will open at `http://localhost:5173`.

## 5. Usage
1. Open the frontend URL.
2. Enter text to be spoken.
3. Upload a clear face image (JPG/PNG).
4. Click "Generate Lip-Sync Video".
5. Wait for the process to complete and download the result.

## Troubleshooting
- **"Torch not found"**: Ensure `poetry install` completed without errors.
- **"Model not found"**: Verify files in `backend/models/`.
- **Backend Error 500**: Check the terminal output of `uvicorn` for details.
