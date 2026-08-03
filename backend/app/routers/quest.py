from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import User
from app.quest import evaluate_checkout, get_or_create_progress, progress_payload
from app.seed_utils import get_or_create_demo_user

router = APIRouter(tags=["quest"])


class CheckoutRequest(BaseModel):
    category: str = Field(min_length=1)
    user_id: int | None = None


class CheckoutResponse(BaseModel):
    spinUnlocked: bool
    message: str
    rewardEligible: bool
    unlockType: str | None = None
    orderCategory: str
    progress: dict


@router.post("/checkout", response_model=CheckoutResponse)
def checkout(body: CheckoutRequest, db: Session = Depends(get_db)):
    if body.user_id is not None:
        user = db.query(User).filter(User.id == body.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    else:
        user = get_or_create_demo_user(db)

    try:
        result = evaluate_checkout(db, user, body.category)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    return result


@router.get("/progress")
def get_progress(
    user_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    if user_id is not None:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
    else:
        user = get_or_create_demo_user(db)

    progress = get_or_create_progress(db, user.id)
    db.commit()
    return progress_payload(progress)
