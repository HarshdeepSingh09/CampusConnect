import os
from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import auth
import issues
from database import init_db


@asynccontextmanager
async def lifespan(app):
    init_db()
    yield


app = FastAPI(title="CampusConnect", lifespan=lifespan)
app.include_router(auth.router)
app.include_router(issues.router)

# Locally, FastAPI serves the website from the public/ folder.
# On Vercel, files in public/ are served by Vercel itself.
if not os.environ.get("VERCEL"):
    PUBLIC_DIR = Path(__file__).parent.parent / "public"
    app.mount("/", StaticFiles(directory=PUBLIC_DIR, html=True), name="frontend")