from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models import Order, User, UserProgress

MAX_SPINS_PER_MONTH = 3


def current_month() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m")


def parse_explored(raw: str) -> list[str]:
    if not raw or not raw.strip():
        return []
    return [part.strip() for part in raw.split(",") if part.strip()]


def serialize_explored(categories: list[str]) -> str:
    return ",".join(categories)


def get_or_create_progress(db: Session, user_id: int, month: str | None = None) -> UserProgress:
    month_key = month or current_month()
    progress = (
        db.query(UserProgress)
        .filter(UserProgress.user_id == user_id, UserProgress.month == month_key)
        .first()
    )
    if progress:
        return progress

    progress = UserProgress(
        user_id=user_id,
        month=month_key,
        starter_spin_used=False,
        explored_categories="",
        spins_earned=0,
        spins_remaining=0,
    )
    db.add(progress)
    db.flush()
    return progress


def progress_payload(progress: UserProgress) -> dict:
    explored = parse_explored(progress.explored_categories)
    return {
        "user_id": progress.user_id,
        "month": progress.month,
        "starter_spin": progress.starter_spin_used,
        "new_category_1": len(explored) >= 2,
        "new_category_2": len(explored) >= 3,
        "explored_categories": explored,
        "spins_earned": progress.spins_earned,
        "spins_remaining": progress.spins_remaining,
        "max_spins": MAX_SPINS_PER_MONTH,
    }


def evaluate_checkout(db: Session, user: User, category: str) -> dict:
    """Apply business rules 1–5. Returns checkout response + updated progress."""
    category = category.strip()
    if not category:
        raise ValueError("category is required")

    order = Order(user_id=user.id, category=category)
    db.add(order)

    progress = get_or_create_progress(db, user.id)
    explored = parse_explored(progress.explored_categories)
    is_first_order = not progress.starter_spin_used
    category_already_explored = category in explored
    spin_unlocked = False
    reward_eligible = False
    message = ""
    unlock_type: str | None = None

    if is_first_order:
        # Rule 1: first order of the month → Starter Spin
        if progress.spins_earned < MAX_SPINS_PER_MONTH:
            progress.spins_earned += 1
            progress.spins_remaining += 1
            spin_unlocked = True
            reward_eligible = True
            unlock_type = "starter"
            message = "Welcome to Category Quest! You earned your Starter Spin."
        progress.starter_spin_used = True
        if not category_already_explored:
            explored.append(category)
        progress.explored_categories = serialize_explored(explored)

    elif category_already_explored:
        # Rule 5: repeat category → no spin
        spin_unlocked = False
        reward_eligible = False
        unlock_type = None
        message = "No new spin earned. Explore another category to unlock your next Spin."

    else:
        # New category this month
        explored.append(category)
        progress.explored_categories = serialize_explored(explored)

        if progress.spins_earned < MAX_SPINS_PER_MONTH:
            # Rule 2 + 3: new category grants another spin up to max 3
            progress.spins_earned += 1
            progress.spins_remaining += 1
            spin_unlocked = True
            reward_eligible = True
            unlock_type = "new_category"
            message = "New Category Unlocked! You earned another Spin."
        else:
            spin_unlocked = False
            reward_eligible = False
            unlock_type = None
            message = "Category explored! You've already earned all 3 spins this month."

    db.commit()
    db.refresh(progress)

    return {
        "spinUnlocked": spin_unlocked,
        "message": message,
        "rewardEligible": reward_eligible,
        "unlockType": unlock_type,
        "orderCategory": category,
        "progress": progress_payload(progress),
    }
