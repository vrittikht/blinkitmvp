from __future__ import annotations

import random
from datetime import datetime, timedelta, timezone

from sqlalchemy.orm import Session

from app.models import Coupon, RewardTemplate, User
from app.quest import get_or_create_progress, progress_payload
from app.rewards_data import REWARD_TEMPLATES

COUPON_VALID_DAYS = 30

# Curated 8 reward_name values for the wheel (must exist in REWARD_TEMPLATES)
WHEEL_REWARD_NAMES = [
    "₹50 OFF Pharmacy",
    "₹75 OFF Kitchen Essentials",
    "₹80 OFF Stationery",
    "Free Delivery",
    "₹40 OFF Beauty",
    "₹45 OFF Snacks",
    "2× Reward Points",
    "₹60 OFF Home Cleaning",
]


def seed_reward_templates(db: Session) -> int:
    created = 0
    existing = {t.reward_name for t in db.query(RewardTemplate).all()}
    for entry in REWARD_TEMPLATES:
        if entry["reward_name"] in existing:
            continue
        db.add(
            RewardTemplate(
                reward_name=entry["reward_name"],
                discount=entry["discount"],
                category=entry["category"],
            )
        )
        created += 1
    if created:
        db.commit()
    return created


def list_templates(db: Session) -> list[RewardTemplate]:
    return db.query(RewardTemplate).order_by(RewardTemplate.id).all()


def wheel_segments(db: Session) -> list[dict]:
    templates = list_templates(db)
    by_name = {t.reward_name: t for t in templates}
    segments: list[dict] = []

    for name in WHEEL_REWARD_NAMES:
        t = by_name.get(name)
        if not t:
            continue
        label = t.discount if not t.category else f"{t.discount.split()[0]} {(t.category or '').split()[0]}"
        if t.category is None:
            label = t.discount if "Delivery" in t.reward_name or "Points" in t.reward_name else t.reward_name
            if "Free Delivery" in t.reward_name:
                label = "Free Delivery"
            elif "Points" in t.reward_name:
                label = "2× Points"
        segments.append(
            {
                "template_id": t.id,
                "label": label[:18],
                "reward_name": t.reward_name,
                "discount": t.discount,
                "category": t.category,
            }
        )

    if len(segments) < 8:
        for t in templates:
            if any(s["template_id"] == t.id for s in segments):
                continue
            segments.append(
                {
                    "template_id": t.id,
                    "label": t.discount[:18],
                    "reward_name": t.reward_name,
                    "discount": t.discount,
                    "category": t.category,
                }
            )
            if len(segments) >= 8:
                break

    return segments[:8]


def perform_spin(db: Session, user: User) -> dict:
    progress = get_or_create_progress(db, user.id)
    if progress.spins_remaining <= 0:
        raise ValueError("No spins remaining")

    templates = list_templates(db)
    if not templates:
        raise ValueError("No reward templates configured")

    segments = wheel_segments(db)
    template = random.choice(templates)
    expiry = datetime.now(timezone.utc) + timedelta(days=COUPON_VALID_DAYS)

    coupon = Coupon(
        user_id=user.id,
        reward_name=template.reward_name,
        discount=template.discount,
        category=template.category,
        expiry_date=expiry,
        status="active",
    )
    db.add(coupon)

    progress.spins_remaining = max(0, progress.spins_remaining - 1)
    db.commit()
    db.refresh(coupon)
    db.refresh(progress)

    segment_index = next((i for i, s in enumerate(segments) if s["template_id"] == template.id), None)
    if segment_index is None:
        segment_index = next(
            (
                i
                for i, s in enumerate(segments)
                if s["discount"] == template.discount
                or (template.category and s.get("category") == template.category)
            ),
            0,
        )

    return {
        "coupon": {
            "id": coupon.id,
            "reward_name": coupon.reward_name,
            "discount": coupon.discount,
            "category": coupon.category,
            "expiry_date": coupon.expiry_date.isoformat(),
            "status": coupon.status,
            "days_remaining": COUPON_VALID_DAYS,
        },
        "template_id": template.id,
        "segment_index": segment_index,
        "segments": segments,
        "progress": progress_payload(progress),
        "message": f"You won {template.reward_name}",
    }


def list_active_coupons(db: Session, user_id: int) -> list[dict]:
    now = datetime.now(timezone.utc)
    coupons = (
        db.query(Coupon)
        .filter(Coupon.user_id == user_id, Coupon.status == "active")
        .order_by(Coupon.id.desc())
        .all()
    )
    result = []
    for c in coupons:
        expiry = c.expiry_date
        if expiry.tzinfo is None:
            expiry = expiry.replace(tzinfo=timezone.utc)
        if expiry < now:
            continue
        days = max(0, (expiry - now).days)
        result.append(
            {
                "id": c.id,
                "reward_name": c.reward_name,
                "discount": c.discount,
                "category": c.category,
                "expiry_date": expiry.isoformat(),
                "status": c.status,
                "days_remaining": days,
            }
        )
    return result


def redeem_coupon(db: Session, user_id: int, coupon_id: int) -> dict:
    coupon = (
        db.query(Coupon)
        .filter(Coupon.id == coupon_id, Coupon.user_id == user_id)
        .first()
    )
    if not coupon:
        raise ValueError("Coupon not found")
    if coupon.status != "active":
        raise ValueError("Coupon already used")
    coupon.status = "redeemed"
    db.commit()
    return {"id": coupon.id, "status": coupon.status, "message": "Coupon redeemed (mock)"}
