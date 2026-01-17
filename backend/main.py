import sys
import torchvision.transforms.functional as F
# Monkeypatch for basicsr compatibility with newer torchvision
sys.modules['torchvision.transforms.functional_tensor'] = F

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api import routes
from utils.file_handler import init_temp_dir, cleanup_temp_dir

app = FastAPI(title="Lip-Sync Generator API")

# CORS Configuration
origins = [
    "http://localhost:5173",  # Vite default
    "http://localhost:3000",
    "*"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup/Shutdown events
@app.on_event("startup")
async def startup_event():
    init_temp_dir()

@app.on_event("shutdown")
async def shutdown_event():
    cleanup_temp_dir()

# Include Routes
app.include_router(routes.router, prefix="/api")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
