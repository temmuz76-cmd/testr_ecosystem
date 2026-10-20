import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends, HTTPException, Response, UploadFile
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlmodel import Session, SQLModel, select

from ..auth import create_token, current_admin, hash_password, verify_password
from ..config import ALLOWED_UPLOAD_EXT, COOKIE_NAME, COOKIE_SECURE, JWT_EXPIRE_HOURS, MAX_UPLOAD_MB, UPLOAD_DIR
from ..db import get_session
from ..models import AdminUser, Experience, Feature, Media, Message, Page, Post, Project, Service, Setting

router = APIRouter(prefix="/api/admin", tags=["admin"])
protected = APIRouter(prefix="/api/admin", tags=["admin"], dependencies=[Depends(current_admin)])


# --- auth -----------------------------------------------------------------

class LoginIn(BaseModel):
    email: str
    password: str


@router.post("/login")
def login(data: LoginIn, response: Response, session: Session = Depends(get_session)):
    user = session.exec(select(AdminUser).where(AdminUser.email == data.email.lower().strip())).first()
    if not user or not verify_password(data.password, user.password_hash):
        raise HTTPException(401, "E-posta veya şifre hatalı")
    response.set_cookie(
        COOKIE_NAME,
        create_token(user),
        httponly=True,
        samesite="lax",
        secure=COOKIE_SECURE,
        max_age=JWT_EXPIRE_HOURS * 3600,
        path="/",
    )
    return {"email": user.email, "name": user.name}


@router.post("/logout")
def logout(response: Response):
    response.delete_cookie(COOKIE_NAME, path="/")
    return {"ok": True}


@protected.get("/me")
def me(user: AdminUser = Depends(current_admin)):
    return {"email": user.email, "name": user.name}


class PasswordIn(BaseModel):
    current_password: str
    new_password: str


@protected.post("/password")
def change_password(
    data: PasswordIn, user: AdminUser = Depends(current_admin), session: Session = Depends(get_session)
):
    if not verify_password(data.current_password, user.password_hash):
        raise HTTPException(400, "Mevcut şifre hatalı")
    if len(data.new_password) < 10:
        raise HTTPException(400, "Yeni şifre en az 10 karakter olmalı")
    user.password_hash = hash_password(data.new_password)
    session.add(user)
    session.commit()
    return {"ok": True}


# --- dashboard ------------------------------------------------------------

@protected.get("/stats")
def stats(session: Session = Depends(get_session)):
    def count(model, *where):
        return session.exec(select(func.count()).select_from(model).where(*where)).one()

    latest = session.exec(select(Message).order_by(Message.created_at.desc()).limit(5)).all()
    top_posts = session.exec(select(Post).order_by(Post.views.desc()).limit(5)).all()
    return {
        "services": count(Service),
        "posts": count(Post),
        "projects": count(Project) + count(Experience),
        "messages": count(Message),
        "unread": count(Message, Message.is_read == False),  # noqa: E712
        "views": session.exec(select(func.coalesce(func.sum(Post.views), 0))).one(),
        "latest_messages": latest,
        "top_posts": [{"id": p.id, "title": p.title_tr, "slug": p.slug, "views": p.views} for p in top_posts],
    }


# --- generic CRUD for list-type content -----------------------------------

def register_crud(name: str, model: type[SQLModel], order_by):
    @protected.get(f"/{name}", name=f"list_{name}")
    def list_items(session: Session = Depends(get_session)):
        return session.exec(select(model).order_by(*order_by)).all()

    @protected.get(f"/{name}/{{item_id}}", name=f"get_{name}")
    def get_item(item_id: int, session: Session = Depends(get_session)):
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, "Kayıt bulunamadı")
        return item

    def _apply(item, data: dict[str, Any]):
        for key, value in data.items():
            if key in ("id", "created_at", "updated_at") or key not in model.model_fields:
                continue
            setattr(item, key, value)
        if "updated_at" in model.model_fields:
            item.updated_at = datetime.now(timezone.utc)

    def _save(session: Session, item):
        try:
            # Round-trip through validation so dates/bools from JSON get coerced.
            validated = model.model_validate(item.model_dump())
            for key in model.model_fields:
                setattr(item, key, getattr(validated, key))
            session.add(item)
            session.commit()
        except IntegrityError:
            session.rollback()
            raise HTTPException(409, "Bu kısa ad (slug) zaten kullanılıyor")
        except ValueError as exc:
            session.rollback()
            raise HTTPException(422, str(exc))
        session.refresh(item)
        return item

    @protected.post(f"/{name}", status_code=201, name=f"create_{name}")
    def create_item(data: dict[str, Any], session: Session = Depends(get_session)):
        try:
            item = model.model_validate({k: v for k, v in data.items() if k not in ("id", "created_at", "updated_at")})
        except ValueError as exc:
            raise HTTPException(422, str(exc))
        return _save(session, item)

    @protected.put(f"/{name}/{{item_id}}", name=f"update_{name}")
    def update_item(item_id: int, data: dict[str, Any], session: Session = Depends(get_session)):
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, "Kayıt bulunamadı")
        _apply(item, data)
        return _save(session, item)

    @protected.delete(f"/{name}/{{item_id}}", name=f"delete_{name}")
    def delete_item(item_id: int, session: Session = Depends(get_session)):
        item = session.get(model, item_id)
        if not item:
            raise HTTPException(404, "Kayıt bulunamadı")
        session.delete(item)
        session.commit()
        return {"ok": True}


register_crud("services", Service, (Service.sort_order, Service.id))
register_crud("posts", Post, (Post.published_at.desc(), Post.id.desc()))
register_crud("projects", Project, (Project.sort_order, Project.id))
register_crud("experiences", Experience, (Experience.sort_order, Experience.id))
register_crud("features", Feature, (Feature.sort_order, Feature.id))


# --- messages -------------------------------------------------------------

@protected.get("/messages")
def list_messages(session: Session = Depends(get_session)):
    return session.exec(select(Message).order_by(Message.created_at.desc())).all()


class MessagePatch(BaseModel):
    is_read: bool


@protected.patch("/messages/{item_id}")
def mark_message(item_id: int, data: MessagePatch, session: Session = Depends(get_session)):
    msg = session.get(Message, item_id)
    if not msg:
        raise HTTPException(404, "Mesaj bulunamadı")
    msg.is_read = data.is_read
    session.add(msg)
    session.commit()
    return msg


@protected.delete("/messages/{item_id}")
def delete_message(item_id: int, session: Session = Depends(get_session)):
    msg = session.get(Message, item_id)
    if not msg:
        raise HTTPException(404, "Mesaj bulunamadı")
    session.delete(msg)
    session.commit()
    return {"ok": True}


# --- settings & pages -----------------------------------------------------

@protected.get("/settings/{key}")
def get_setting(key: str, session: Session = Depends(get_session)):
    row = session.get(Setting, key)
    return row.value if row else {}


@protected.put("/settings/{key}")
def put_setting(key: str, data: dict[str, Any], session: Session = Depends(get_session)):
    row = session.get(Setting, key) or Setting(key=key)
    row.value = data
    row.updated_at = datetime.now(timezone.utc)
    session.add(row)
    session.commit()
    return row.value


@protected.get("/pages")
def list_pages(session: Session = Depends(get_session)):
    return session.exec(select(Page)).all()


@protected.get("/pages/{key}")
def get_page(key: str, session: Session = Depends(get_session)):
    return session.get(Page, key) or Page(key=key)


@protected.put("/pages/{key}")
def put_page(key: str, data: dict[str, Any], session: Session = Depends(get_session)):
    row = session.get(Page, key) or Page(key=key)
    for field, value in data.items():
        if field in Page.model_fields and field not in ("key", "updated_at"):
            setattr(row, field, value)
    row.updated_at = datetime.now(timezone.utc)
    session.add(row)
    session.commit()
    session.refresh(row)
    return row


# --- media ----------------------------------------------------------------

@protected.get("/media")
def list_media(session: Session = Depends(get_session)):
    return session.exec(select(Media).order_by(Media.created_at.desc())).all()


@protected.post("/media", status_code=201)
async def upload_media(file: UploadFile, session: Session = Depends(get_session)):
    original = file.filename or "dosya"
    ext = ("." + original.rsplit(".", 1)[-1].lower()) if "." in original else ""
    if ext not in ALLOWED_UPLOAD_EXT:
        raise HTTPException(400, f"İzin verilmeyen dosya türü: {ext or '?'}")
    data = await file.read()
    if len(data) > MAX_UPLOAD_MB * 1024 * 1024:
        raise HTTPException(400, f"Dosya {MAX_UPLOAD_MB} MB sınırını aşıyor")
    month = datetime.now().strftime("%Y/%m")
    target_dir = UPLOAD_DIR / month
    target_dir.mkdir(parents=True, exist_ok=True)
    name = f"{uuid.uuid4().hex[:12]}{ext}"
    (target_dir / name).write_bytes(data)
    media = Media(
        filename=original, url=f"/uploads/{month}/{name}", content_type=file.content_type or "", size=len(data)
    )
    session.add(media)
    session.commit()
    session.refresh(media)
    return media


@protected.delete("/media/{item_id}")
def delete_media(item_id: int, session: Session = Depends(get_session)):
    media = session.get(Media, item_id)
    if not media:
        raise HTTPException(404, "Dosya bulunamadı")
    path = (UPLOAD_DIR / media.url.removeprefix("/uploads/")).resolve()
    if path.is_relative_to(UPLOAD_DIR.resolve()) and path.exists():
        path.unlink()
    session.delete(media)
    session.commit()
    return {"ok": True}
