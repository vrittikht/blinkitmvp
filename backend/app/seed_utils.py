from sqlalchemy.orm import Session

from app.database import SessionLocal, init_db
from app.models import User

DEMO_USER_NAME = "Rahul Sharma"


def get_or_create_demo_user(db: Session) -> User:
    user = db.query(User).filter(User.name == DEMO_USER_NAME).first()
    if user:
        return user
    # Migrate legacy demo name if present
    legacy = db.query(User).filter(User.name == "Demo User").first()
    if legacy:
        legacy.name = DEMO_USER_NAME
        db.commit()
        db.refresh(legacy)
        return legacy
    user = User(name=DEMO_USER_NAME)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user
