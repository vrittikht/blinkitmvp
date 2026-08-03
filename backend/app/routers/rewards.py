from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.rewards import (
    list_active_coupons,
    perform_spin,
    redeem_coupon,
    seed_reward_templates,
    wheel_segments,
)
from app.seed_utils import get_or_create_demo_user

router = APIRouter(tags=["rewards"])


def _resolve_user(db: Session, user_id: int | None) -> User:
    if user_id is not None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        return user
    return get_or_create_demo_user(db)


class SpinRequest(BaseModel):
    user_id: int | None = None


class RedeemRequest(BaseModel):
    user_id: int | None = None


@router.get("/reward-templates")
def get_reward_templates(db: Session = Depends(get_db)):
    seed_reward_templates(db)
    return wheel_segments(db)


@router.post("/spin")
def spin(body: SpinRequest | None = None, db: Session = Depends(get_db)):
    body = body or SpinRequest()
    user = _resolve_user(db, body.user_id)
    seed_reward_templates(db)
    try:
        return perform_spin(db, user)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


@router.get("/coupons")
def get_coupons(
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    user = _resolve_user(db, user_id)
    return list_active_coupons(db, user.id)


@router.post("/coupons/{coupon_id}/redeem")
def redeem(coupon_id: int, body: RedeemRequest | None = None, db: Session = Depends(get_db)):
    body = body or RedeemRequest()
    user = _resolve_user(db, body.user_id)
    try:
        return redeem_coupon(db, user.id, coupon_id)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
