from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles

from .config import UPLOAD_DIR
from .db import init_db
from .routers import admin, public


@asynccontextmanager
async def lifespan(_: FastAPI):
    init_db()
    yield


app = FastAPI(title="TESTR API", version="1.0.0", lifespan=lifespan)

app.include_router(public.router)
app.include_router(admin.router)
app.include_router(admin.protected)

UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


@app.get("/api/health")
def health():
    return {"ok": True}
