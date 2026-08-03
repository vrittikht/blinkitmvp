"""
Seed catalog + demo user + product images.
Run: python -m app.seed
"""

from app.catalog_data import CATALOG
from app.database import SessionLocal, init_db
from app.models import Category, Product, RewardTemplate
from app.rewards import seed_reward_templates
from app.seed_utils import get_or_create_demo_user


def seed_catalog(db) -> tuple[int, int]:
    created_categories = 0
    created_products = 0

    for entry in CATALOG:
        category = db.query(Category).filter(Category.name == entry["name"]).first()
        if not category:
            category = Category(
                name=entry["name"],
                icon=entry["icon"],
                color=entry["color"],
            )
            db.add(category)
            db.flush()
            created_categories += 1

        by_name = {p.name: p for p in category.products}
        for row in entry["products"]:
            name, price, unit, image_url = row
            existing = by_name.get(name)
            if existing:
                if existing.image_url != image_url:
                    existing.image_url = image_url
                    existing.price = price
                    existing.unit = unit
                continue
            db.add(
                Product(
                    category_id=category.id,
                    name=name,
                    price=price,
                    unit=unit,
                    image_url=image_url,
                )
            )
            created_products += 1

    db.commit()
    return created_categories, created_products


def seed() -> None:
    init_db()
    db = SessionLocal()
    try:
        user = get_or_create_demo_user(db)
        cats, products = seed_catalog(db)
        rewards = seed_reward_templates(db)
        total_cats = db.query(Category).count()
        total_products = db.query(Product).count()
        total_rewards = db.query(RewardTemplate).count()
        with_images = db.query(Product).filter(Product.image_url.isnot(None)).count()
        print(f"Demo user ready id={user.id} name={user.name}")
        print(f"Seeded +{cats} categories, +{products} products, +{rewards} rewards")
        print(
            f"Totals: {total_cats} categories, {total_products} products "
            f"({with_images} with images), {total_rewards} reward templates"
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed()
