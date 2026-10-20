"""Database tables.

Translatable text is stored as `<field>_tr` / `<field>_en` columns; the frontend
falls back to Turkish when an English value is empty.
"""

from datetime import date, datetime, timezone
from typing import Any

from sqlalchemy import JSON, Column
from sqlmodel import Field, SQLModel


def now() -> datetime:
    return datetime.now(timezone.utc)


class AdminUser(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    email: str = Field(unique=True, index=True)
    name: str = ""
    password_hash: str
    created_at: datetime = Field(default_factory=now)


class Setting(SQLModel, table=True):
    key: str = Field(primary_key=True)
    value: dict[str, Any] = Field(default_factory=dict, sa_column=Column(JSON))
    updated_at: datetime = Field(default_factory=now)


class Page(SQLModel, table=True):
    key: str = Field(primary_key=True)
    title_tr: str = ""
    title_en: str = ""
    subtitle_tr: str = ""
    subtitle_en: str = ""
    body_tr: str = ""
    body_en: str = ""
    image: str = ""
    header_image: str = ""
    updated_at: datetime = Field(default_factory=now)


class Service(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title_tr: str
    title_en: str = ""
    summary_tr: str = ""
    summary_en: str = ""
    body_tr: str = ""
    body_en: str = ""
    image: str = ""
    sort_order: int = 0
    show_on_home: bool = True
    is_published: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Post(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    slug: str = Field(unique=True, index=True)
    title_tr: str
    title_en: str = ""
    excerpt_tr: str = ""
    excerpt_en: str = ""
    body_tr: str = ""
    body_en: str = ""
    image: str = ""
    tags: str = ""
    published_at: date = Field(default_factory=date.today)
    views: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Project(SQLModel, table=True):
    """A row under 'TESTR Project Experience' on the references page."""

    id: int | None = Field(default=None, primary_key=True)
    client: str
    title_tr: str = ""
    title_en: str = ""
    category_tr: str = ""
    category_en: str = ""
    sort_order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Experience(SQLModel, table=True):
    """A country block under 'Management Experience' on the references page."""

    id: int | None = Field(default=None, primary_key=True)
    flag: str = ""
    country_tr: str = ""
    country_en: str = ""
    title_tr: str = ""
    title_en: str = ""
    description_tr: str = ""
    description_en: str = ""
    tags_tr: str = ""
    tags_en: str = ""
    sort_order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Feature(SQLModel, table=True):
    """'Fark Yaratıyoruz' cards shown on service detail pages."""

    id: int | None = Field(default=None, primary_key=True)
    title_tr: str
    title_en: str = ""
    text_tr: str = ""
    text_en: str = ""
    icon: str = ""
    sort_order: int = 0
    is_published: bool = True
    created_at: datetime = Field(default_factory=now)
    updated_at: datetime = Field(default_factory=now)


class Message(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    email: str
    phone: str = ""
    subject: str = ""
    message: str
    is_read: bool = False
    created_at: datetime = Field(default_factory=now)


class Media(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    filename: str
    url: str = Field(unique=True)
    content_type: str = ""
    size: int = 0
    created_at: datetime = Field(default_factory=now)
