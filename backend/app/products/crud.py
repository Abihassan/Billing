from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from .models import Product
from . import schemas

def get_product(db: Session, product_id: UUID) -> Optional[Product]:
    return db.query(Product).filter(Product.id == product_id).first()

def get_products(db: Session, skip: int = 0, limit: int = 100) -> List[Product]:
    return (
        db.query(Product)
        .order_by(Product.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_product(db: Session, product_in: schemas.ProductCreate) -> Product:
    db_obj = Product(**product_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_product(db: Session, db_obj: Product, product_in: schemas.ProductUpdate):
    data = product_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_product(db: Session, db_obj: Product):
    db.delete(db_obj)
    db.commit()
