from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

import auth
import issues
from database import init_db


# Initialize the database when the server starts
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


# Create the FastAPI application
app = FastAPI(
    title="CampusConnect",
    lifespan=lifespan
)

# Register authentication and issue-related routes
app.include_router(auth.router)
app.include_router(issues.router)


# Serve the frontend files
FRONTEND_DIR = Path(__file__).parent.parent / "frontend"

app.mount(
    "/",
    StaticFiles(directory=FRONTEND_DIR, html=True),
    name="frontend"
)