from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models import Category, Product
from app.schemas import CategoryOut, ProductOut

router = APIRouter(tags=["catalog"])


@router.get("/categories", response_model=list[CategoryOut])
def list_categories(db: Session = Depends(get_db)):
    return db.query(Category).order_by(Category.id).all()


@router.get("/categories/{category_id}", response_model=CategoryOut)
def get_category(category_id: int, db: Session = Depends(get_db)):
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.get("/products", response_model=list[ProductOut])
def list_products(
    category_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
):
    query = db.query(Product).options(joinedload(Product.category))
    if category_id is not None:
        query = query.filter(Product.category_id == category_id)

    products = query.order_by(Product.id).all()
    result: list[ProductOut] = []
    for product in products:
        result.append(
            ProductOut(
                id=product.id,
                category_id=product.category_id,
                name=product.name,
                price=product.price,
                unit=product.unit,
                image_url=product.image_url,
                category_name=product.category.name if product.category else None,
            )
        )
    return result
