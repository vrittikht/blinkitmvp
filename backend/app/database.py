import os
import shutil
from collections.abc import Generator
from pathlib import Path

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import get_settings

settings = get_settings()
db_url = settings.sqlalchemy_database_url

# In serverless environments (Netlify / AWS Lambda), the root folder is read-only.
# If using SQLite without Postgres env var, redirect SQLite path to /tmp.
if db_url.startswith("sqlite") and (os.environ.get("NETLIFY") or os.environ.get("AWS_LAMBDA_FUNCTION_NAME")):
    tmp_db_path = Path("/tmp/category_quest.db")
    if not tmp_db_path.exists():
        for source in (Path("mvp_category_quest.db"), Path("category_quest.db")):
            if source.exists():
                try:
                    shutil.copy(source, tmp_db_path)
                    break
                except Exception:
                    pass
    db_url = f"sqlite:///{tmp_db_path}"

connect_args: dict = {}
if db_url.startswith("sqlite"):
    connect_args["check_same_thread"] = False

engine = create_engine(db_url, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create tables on startup (MVP; Alembic can replace this later)."""
    from app import models  # noqa: F401

    Base.metadata.create_all(bind=engine)
