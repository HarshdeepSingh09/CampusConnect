import hashlib
import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, Header, HTTPException
from pydantic import BaseModel, Field

from database import get_db

router = APIRouter(prefix="/api")


# Get the current date and time
def now():
    return datetime.now(timezone.utc).isoformat()


# Convert the password into a secure hash
def hash_password(password, salt):
    password_bytes = password.encode()
    salt_bytes = salt.encode()

    hashed = hashlib.pbkdf2_hmac(
        "sha256",
        password_bytes,
        salt_bytes,
        100_000
    )

    return hashed.hex()


# Data required to register a new user
class RegisterIn(BaseModel):
    name: str = Field(min_length=2, max_length=60)
    email: str = Field(
        pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        max_length=120
    )
    password: str = Field(min_length=6, max_length=100)


# Data required to log in
class LoginIn(BaseModel):
    email: str
    password: str


# Get the currently logged-in user
def get_current_user(
    authorization: str = Header(None),
    db=Depends(get_db)
):
    token = (authorization or "").removeprefix("Bearer ").strip()

    user = db.execute(
        """
        SELECT u.id, u.name, u.email, u.created_at
        FROM sessions s
        JOIN users u ON u.id = s.user_id
        WHERE s.token = ?
        """,
        (token,)
    ).fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Your session has ended. Please log in again."
        )

    return dict(user)


# Create a session after registration or login
def start_session(db, user):
    token = secrets.token_urlsafe(32)

    db.execute(
        "INSERT INTO sessions (token, user_id) VALUES (?, ?)",
        (token, user["id"])
    )
    db.commit()

    return {
        "token": token,
        "user": {
            "id": user["id"],
            "name": user["name"],
            "email": user["email"]
        }
    }


# Register a new user
@router.post("/register", status_code=201)
def register(data: RegisterIn, db=Depends(get_db)):
    name = data.name.strip()
    email = data.email.strip().lower()

    existing_user = db.execute(
        "SELECT 1 FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if existing_user:
        raise HTTPException(
            status_code=409,
            detail="This email is already registered. Try logging in."
        )

    salt = secrets.token_hex(16)
    password_hash = hash_password(data.password, salt)

    result = db.execute(
        """
        INSERT INTO users
        (name, email, password_hash, salt, created_at)
        VALUES (?, ?, ?, ?, ?)
        """,
        (name, email, password_hash, salt, now())
    )

    db.commit()

    user = {
        "id": result.lastrowid,
        "name": name,
        "email": email
    }

    return start_session(db, user)


# Log in an existing user
@router.post("/login")
def login(data: LoginIn, db=Depends(get_db)):
    email = data.email.strip().lower()

    user = db.execute(
        "SELECT * FROM users WHERE email = ?",
        (email,)
    ).fetchone()

    if not user:
        raise HTTPException(
            status_code=401,
            detail="Wrong email or password."
        )

    password_hash = hash_password(data.password, user["salt"])

    if not secrets.compare_digest(password_hash, user["password_hash"]):
        raise HTTPException(
            status_code=401,
            detail="Wrong email or password."
        )

    return start_session(db, user)


# Log out the current user
@router.post("/logout")
def logout(
    authorization: str = Header(None),
    db=Depends(get_db)
):
    token = (authorization or "").removeprefix("Bearer ").strip()

    db.execute(
        "DELETE FROM sessions WHERE token = ?",
        (token,)
    )
    db.commit()

    return {"ok": True}


# Get the logged-in user's details and issue counts
@router.get("/me")
def me(user=Depends(get_current_user), db=Depends(get_db)):
    rows = db.execute(
        """
        SELECT status, COUNT(*) AS n
        FROM issues
        WHERE created_by = ?
        GROUP BY status
        """,
        (user["id"],)
    ).fetchall()

    counts = {}

    for row in rows:
        counts[row["status"]] = row["n"]

    return {**user, "counts": counts}