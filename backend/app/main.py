from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import SessionLocal, init_db
from app.rewards import seed_reward_templates
from app.routers import catalog, quest, rewards
from app.seed import seed_catalog
from app.seed_utils import get_or_create_demo_user


def bootstrap_data() -> None:
    """Create schema + seed catalog/rewards/demo user (safe to re-run)."""
    init_db()
    db = SessionLocal()
    try:
        get_or_create_demo_user(db)
        # Always re-run catalog seed so product image URLs stay up to date
        seed_catalog(db)
        seed_reward_templates(db)
    finally:
        db.close()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    settings = get_settings()
    if settings.seed_on_startup:
        bootstrap_data()
    else:
        init_db()
    yield


settings = get_settings()

app = FastAPI(
    title="Category Quest API",
    description="Blinkit Category Quest MVP — Phase 5 shippable",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog.router)
app.include_router(quest.router)
app.include_router(rewards.router)


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "category-quest-api",
        "phase": 5,
        "version": "1.0.0",
    }


@app.post("/admin/seed")
def force_seed():
    """Idempotent re-seed for Railway one-shot / recovery. No auth in MVP."""
    bootstrap_data()
    return {"status": "seeded"}
