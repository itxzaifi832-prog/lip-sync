import torch
import sys

def check_torch():
    print(f"Python: {sys.version}")
    print(f"Torch Version: {torch.__version__}")
    print(f"CUDA Available: {torch.cuda.is_available()}")
    
    if "cpu" in torch.__version__ or not torch.cuda.is_available():
        print("SUCCESS: Running on CPU mode as requested.")
    else:
        print("WARNING: GPU version detected. This is fine, but CPU-only was requested for size.")

if __name__ == "__main__":
    check_torch()
