import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent


def _load_env_file() -> None:
    env_path = BASE_DIR / ".env"
    if not env_path.exists():
        return
    for line in env_path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip())


_load_env_file()

DATABASE_URL = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR / 'data' / 'testr.db'}")
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", BASE_DIR / "uploads"))
JWT_SECRET = os.getenv("JWT_SECRET", "dev-secret-change-me")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "168"))
COOKIE_NAME = "testr_admin"
COOKIE_SECURE = os.getenv("COOKIE_SECURE", "false").lower() == "true"
MAX_UPLOAD_MB = int(os.getenv("MAX_UPLOAD_MB", "50"))
ALLOWED_UPLOAD_EXT = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".mp4", ".webm", ".pdf"}
