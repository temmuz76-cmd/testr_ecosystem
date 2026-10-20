from datetime import datetime, timedelta, timezone

import bcrypt
import jwt
from fastapi import Depends, HTTPException, Request, status
from sqlmodel import Session

from .config import COOKIE_NAME, JWT_EXPIRE_HOURS, JWT_SECRET
from .db import get_session
from .models import AdminUser


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode(), bcrypt.gensalt()).decode()


def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(password.encode(), password_hash.encode())


def create_token(user: AdminUser) -> str:
    payload = {
        "sub": str(user.id),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")


def current_admin(request: Request, session: Session = Depends(get_session)) -> AdminUser:
    token = request.cookies.get(COOKIE_NAME)
    auth = request.headers.get("authorization", "")
    if not token and auth.lower().startswith("bearer "):
        token = auth[7:]
    if not token:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Oturum bulunamadı")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"])
    except jwt.PyJWTError:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Oturum geçersiz")
    user = session.get(AdminUser, int(payload["sub"]))
    if not user:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Kullanıcı bulunamadı")
    return user
