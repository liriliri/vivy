import json
import sys
import torch
from packaging import version

def has_mps() -> bool:
    if sys.platform != "darwin":
        return False
    if version.parse(torch.__version__) <= version.parse("2.0.1"):
        if not getattr(torch, 'has_mps', False):
            return False
        try:
            torch.zeros(1).to(torch.device("mps"))
            return True
        except Exception:
            return False
    else:
        return torch.backends.mps.is_available() and torch.backends.mps.is_built()

devices = []
cuda = []

if torch.cuda.is_available():
    num_gpus = torch.cuda.device_count()
    i = 0
    while i < num_gpus:
        devices.append(f"cuda:{i}")
        device_name = torch.cuda.get_device_name(i)
        cuda.append(f"CUDA {i}: {device_name}")
        i += 1

if has_mps():
    devices.append("mps")

devices.append("cpu")

result = {
    "devices": devices,
    "cuda": cuda
}

print(json.dumps(result))
