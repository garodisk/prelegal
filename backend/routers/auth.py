import os
from datetime import datetime, timedelta, timezone

import bcrypt
from fastapi import APIRouter, Depends, Header, HTTPException
from jose import JWTError, jwt
from pydantic import BaseModel, Field

from database import create_user, get_user_by_email, get_user_by_id

SECRET_KEY = os.environ.get("SECRET_KEY", "dev-secret-change-in-prod")
ALGORITHM = "HS256"
TOKEN_EXPIRE_DAYS = 7

router = APIRouter()


def _hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def _verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


class AuthRequest(BaseModel):
    email: str
    password: str = Field(min_length=8)


class AuthResponse(BaseModel):
    id: int
    token: str
    email: str


def _make_token(user_id: int, email: str) -> str:
    exp = datetime.now(timezone.utc) + timedelta(days=TOKEN_EXPIRE_DAYS)
    return jwt.encode({"sub": str(user_id), "email": email, "exp": exp}, SECRET_KEY, algorithm=ALGORITHM)


def get_current_user(authorization: str = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.removeprefix("Bearer ")
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = int(payload["sub"])
    except (JWTError, KeyError, ValueError):
        raise HTTPException(status_code=401, detail="Invalid token")
    user = get_user_by_id(user_id)
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


@router.post("/signup", response_model=AuthResponse)
def signup(req: AuthRequest):
    if get_user_by_email(req.email):
        raise HTTPException(status_code=409, detail="Email already registered")
    password_hash = _hash_password(req.password)
    user_id = create_user(req.email, password_hash)
    return AuthResponse(id=user_id, token=_make_token(user_id, req.email), email=req.email)


@router.post("/signin", response_model=AuthResponse)
def signin(req: AuthRequest):
    user = get_user_by_email(req.email)
    if not user or not _verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthResponse(id=user["id"], token=_make_token(user["id"], user["email"]), email=user["email"])


@router.get("/me")
def me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["id"], "email": current_user["email"]}
