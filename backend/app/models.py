from datetime import datetime

from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), nullable=False)

    orders: Mapped[list["Order"]] = relationship(back_populates="user")
    progress: Mapped[list["UserProgress"]] = relationship(back_populates="user")
    coupons: Mapped[list["Coupon"]] = relationship(back_populates="user")


class Category(Base):
    __tablename__ = "categories"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(120), unique=True, nullable=False)
    icon: Mapped[str] = mapped_column(String(16), default="🛒")
    color: Mapped[str] = mapped_column(String(16), default="#E8F5E9")

    products: Mapped[list["Product"]] = relationship(back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    category_id: Mapped[int] = mapped_column(ForeignKey("categories.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    price: Mapped[float] = mapped_column(Float, nullable=False)
    unit: Mapped[str] = mapped_column(String(40), default="1 unit")
    image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    category: Mapped["Category"] = relationship(back_populates="products")


class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    category: Mapped[str] = mapped_column(String(120), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())

    user: Mapped["User"] = relationship(back_populates="orders")


class RewardTemplate(Base):
    __tablename__ = "reward_templates"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    reward_name: Mapped[str] = mapped_column(String(200), nullable=False)
    discount: Mapped[str] = mapped_column(String(80), nullable=False)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)


class Coupon(Base):
    __tablename__ = "coupons"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    reward_name: Mapped[str] = mapped_column(String(200), nullable=False)
    discount: Mapped[str] = mapped_column(String(80), nullable=False)
    category: Mapped[str | None] = mapped_column(String(120), nullable=True)
    expiry_date: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    status: Mapped[str] = mapped_column(String(40), default="active")

    user: Mapped["User"] = relationship(back_populates="coupons")


class UserProgress(Base):
    __tablename__ = "user_progress"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), nullable=False)
    month: Mapped[str] = mapped_column(String(7), nullable=False)
    starter_spin_used: Mapped[bool] = mapped_column(Boolean, default=False)
    explored_categories: Mapped[str] = mapped_column(Text, default="")
    spins_earned: Mapped[int] = mapped_column(Integer, default=0)
    spins_remaining: Mapped[int] = mapped_column(Integer, default=0)

    user: Mapped["User"] = relationship(back_populates="progress")
