# Lip-Sync Frontend

React + Vite frontend for the Lip-Sync application.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Backend URL (Optional)
Create `.env` file:
```
VITE_API_URL=http://localhost:8000/api
```

### 3. Run Development Server
```bash
npm run dev
```

App will open at `http://localhost:5173`

## Features

- Text input for speech content
- Image upload with preview (JPG/PNG, max 5MB)
- Real-time processing status
- Video playback
- Download generated video

## Components

- **UploadForm**: Text and image input
- **VideoPlayer**: Display and download result
- **LoadingSpinner**: Processing feedback

## Build for Production
```bash
npm run build
```

Output in `dist/` directory.
