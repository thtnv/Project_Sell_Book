from sqlalchemy.orm import Session
from fastapi import HTTPException
from app.models.category import Category  #
from app.schemas.category import CategoryCreate, CategoryUpdate



def get_all(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Category).offset(skip).limit(limit).all()


def get_by_id(db: Session, category_id: str):
    return db.query(Category).filter(Category.category_id == category_id).first()




def create(db: Session, category: CategoryCreate):
    if get_by_id(db, category.category_id):
        raise HTTPException(status_code=400, detail="Category ID already exists")

    existing_name = (
        db.query(Category)
        .filter(Category.category_name == category.category_name)
        .first()
    )
    if existing_name:
        raise HTTPException(status_code=400, detail="Category name already exists")

    new_category = Category(
        category_id=category.category_id, category_name=category.category_name
    )
    db.add(new_category)
    db.commit()
    db.refresh(new_category)
    return new_category


def update(db: Session, category_id: str, category_update: CategoryUpdate):

    category = get_by_id(db, category_id)
    if not category:
        return None

    if category_update.category_name:
        existing = (
            db.query(Category)
            .filter(Category.category_name == category_update.category_name)
            .first()
        )
        if existing and existing.category_id != category_id:
            raise HTTPException(status_code=400, detail="Category name already exists")
        category.category_name = category_update.category_name

    db.commit()
    db.refresh(category)
    return category


def delete(db: Session, category_id: str):

    category = get_by_id(db, category_id)
    if not category:
        return False