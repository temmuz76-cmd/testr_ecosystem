from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, select

from ..db import get_session
from ..models import Experience, Feature, Message, Page, Post, Project, Service, Setting

router = APIRouter(prefix="/api/public", tags=["public"])


def _setting(session: Session, key: str) -> dict:
    row = session.get(Setting, key)
    return row.value if row else {}


@router.get("/site")
def site(session: Session = Depends(get_session)):
    return _setting(session, "site")


@router.get("/services")
def services(home: bool = False, session: Session = Depends(get_session)):
    q = select(Service).where(Service.is_published).order_by(Service.sort_order, Service.id)
    if home:
        q = q.where(Service.show_on_home)
    return session.exec(q).all()


@router.get("/services/{slug}")
def service(slug: str, session: Session = Depends(get_session)):
    row = session.exec(select(Service).where(Service.slug == slug, Service.is_published)).first()
    if not row:
        raise HTTPException(404, "Hizmet bulunamadı")
    return row


@router.get("/posts")
def posts(limit: int | None = None, session: Session = Depends(get_session)):
    q = select(Post).where(Post.is_published).order_by(Post.published_at.desc(), Post.id.desc())
    if limit:
        q = q.limit(limit)
    return session.exec(q).all()


@router.get("/posts/{slug}")
def post(slug: str, count_view: bool = True, session: Session = Depends(get_session)):
    row = session.exec(select(Post).where(Post.slug == slug, Post.is_published)).first()
    if not row:
        raise HTTPException(404, "Yazı bulunamadı")
    if count_view:
        row.views += 1
        session.add(row)
        session.commit()
        session.refresh(row)
    return row


@router.get("/references")
def references(session: Session = Depends(get_session)):
    projects = session.exec(
        select(Project).where(Project.is_published).order_by(Project.sort_order, Project.id)
    ).all()
    experiences = session.exec(
        select(Experience).where(Experience.is_published).order_by(Experience.sort_order, Experience.id)
    ).all()
    return {"projects": projects, "experiences": experiences}


@router.get("/features")
def features(session: Session = Depends(get_session)):
    return session.exec(
        select(Feature).where(Feature.is_published).order_by(Feature.sort_order, Feature.id)
    ).all()


@router.get("/pages/{key}")
def page(key: str, session: Session = Depends(get_session)):
    row = session.get(Page, key)
    if not row:
        raise HTTPException(404, "Sayfa bulunamadı")
    return row


class ContactIn(BaseModel):
    name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    phone: str = Field(default="", max_length=40)
    subject: str = Field(default="", max_length=200)
    message: str = Field(min_length=5, max_length=5000)
    consent: bool
    website: str = ""  # honeypot: real users never fill this hidden field


@router.post("/contact", status_code=201)
def contact(data: ContactIn, session: Session = Depends(get_session)):
    if not data.consent:
        raise HTTPException(422, "Veri işleme onayı gerekli")
    if data.website:
        return {"ok": True}
    session.add(Message(**data.model_dump(exclude={"consent", "website"})))
    session.commit()
    return {"ok": True}
