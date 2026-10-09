import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from database import get_db

router = APIRouter(prefix="/api")


def now():
    return datetime.now(timezone.utc).isoformat()


def hash_password(password, salt):
    return hashlib.pbkdf2_hmac("sha256", password.encode(), salt.encode(), 100_000).hex()


class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str = Field(pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$", max_length=120)
    password: str = Field(min_length=6, max_length=100)


class LoginIn(BaseModel):
    email: str
    password: str


def get_current_user(authorization: str = Header(None), db=Depends(get_db)):
    """Reads 'Authorization: Bearer <token>' and returns the logged-in user."""
    token = (authorization or "").removeprefix("Bearer ").strip()
    user = db.execute(
        "SELECT u.id, u.name, u.email, u.created_at FROM sessions s "
        "JOIN users u ON u.id = s.user_id WHERE s.token = ?", (token,)
    ).fetchone()
    if not user:
        raise HTTPException(401, "Your session has ended. Please log in again.")
    return dict(user)


def start_session(db, user):
    token = secrets.token_urlsafe(32)
    db.execute("INSERT INTO sessions (token, user_id) VALUES (?, ?)", (token, user["id"]))
    db.commit()
    return {"token": token, "user": {"id": user["id"], "name": user["name"], "email": user["email"]}}


@router.post("/register", status_code=201)
def register(data: RegisterIn, db=Depends(get_db)):
    email, name = data.email.strip().lower(), data.name.strip()
    if db.execute("SELECT 1 FROM users WHERE email = ?", (email,)).fetchone():
        raise HTTPException(409, "This email is already registered. Try logging in.")
    salt = secrets.token_hex(16)
    cur = db.execute(
        "INSERT INTO users (name, email, password_hash, salt, created_at) VALUES (?, ?, ?, ?, ?)",
        (name, email, hash_password(data.password, salt), salt, now()),
    )
    db.commit()
    return start_session(db, {"id": cur.lastrowid, "name": name, "email": email})


@router.post("/login")
def login(data: LoginIn, db=Depends(get_db)):
    user = db.execute("SELECT * FROM users WHERE email = ?", (data.email.strip().lower(),)).fetchone()
    if not user or not secrets.compare_digest(hash_password(data.password, user["salt"]), user["password_hash"]):
        raise HTTPException(401, "Wrong email or password.")
    return start_session(db, user)


@router.post("/logout")
def logout(authorization: str = Header(None), db=Depends(get_db)):
    token = (authorization or "").removeprefix("Bearer ").strip()
    db.execute("DELETE FROM sessions WHERE token = ?", (token,))
    db.commit()
    return {"ok": True}


@router.get("/me")
def me(user=Depends(get_current_user), db=Depends(get_db)):
    rows = db.execute(
        "SELECT status, COUNT(*) AS n FROM issues WHERE created_by = ? GROUP BY status", (user["id"],)
    ).fetchall()
    return {**user, "counts": {r["status"]: r["n"] for r in rows}}
