# Lip-Sync Backend

FastAPI backend for generating lip-synced videos from text and face images.

## Setup

### 1. Install Dependencies
```bash
poetry install
```

### 2. Install PyTorch (CPU)
```bash
poetry run pip install torch --index-url https://download.pytorch.org/whl/cpu
```

### 3. Download Models
Download these files and place in `models/` directory:
- **Wav2Lip checkpoint**: [wav2lip.pth](https://github.com/Rudrabha/Wav2Lip/releases/download/v1.0/wav2lip.pth)
- **Face detection**: [s3fd.pth](https://www.adrianbulat.com/downloads/python-fan/s3fd-619a316812.pth)

### 4. Run Server
```bash
poetry run uvicorn main:app --reload
```

Server will start at `http://localhost:8000`

## API Endpoints

### `GET /api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

### `POST /api/generate-lipsync`
Generate lip-synced video.

**Parameters:**
- `text` (form): Text to be spoken
- `image` (file): Face image (JPG/PNG, max 5MB)

**Response:** MP4 video file

## Project Structure
```
backend/
├── api/              # API routes
├── services/         # Business logic (TTS, LipSync)
├── utils/            # Utilities (file handling, validation)
├── models/           # Model checkpoints (gitignored)
├── temp/             # Temporary files (gitignored)
└── main.py           # Application entry point
```

## Troubleshooting

**Import Error: No module named 'torch'**
- Run: `poetry run pip install torch --index-url https://download.pytorch.org/whl/cpu`

**Model not found**
- Ensure models are downloaded to `backend/models/`

**Port already in use**
- Change port: `poetry run uvicorn main:app --reload --port 8001`
