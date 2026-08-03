from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(url: str) -> str:
    """Railway often provides postgres:// — SQLAlchemy needs postgresql+psycopg2://."""
    if url.startswith("postgres://"):
        return url.replace("postgres://", "postgresql+psycopg2://", 1)
    if url.startswith("postgresql://") and "+psycopg2" not in url:
        return url.replace("postgresql://", "postgresql+psycopg2://", 1)
    return url


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "sqlite:///./category_quest.db"
    cors_origins: str = "http://localhost:3000"
    seed_on_startup: bool = True

    @property
    def sqlalchemy_database_url(self) -> str:
        return normalize_database_url(self.database_url)

    @property
    def cors_origin_list(self) -> list[str]:
        origins = [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]
        # Always allow local Next.js during development
        for local in ("http://localhost:3000", "http://127.0.0.1:3000"):
            if local not in origins:
                origins.append(local)
        return origins


@lru_cache
def get_settings() -> Settings:
    return Settings()
