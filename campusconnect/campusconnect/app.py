# Entry file for Vercel. It finds the FastAPI app that lives in backend/main.py.
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "backend"))

from fastapi import FastAPI  # noqa: F401  (lets Vercel recognise this as a FastAPI project)
from main import app  # noqa: E402,F401