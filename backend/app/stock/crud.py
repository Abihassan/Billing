from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from . import models, schemas


def get_stock_item(db: Session, stock_item_id: UUID) -> Optional[models.StockItem]:
    return db.query(models.StockItem).filter(models.StockItem.id == stock_item_id).first()


def get_stock_items(db: Session, skip: int = 0, limit: int = 100) -> List[models.StockItem]:
    return (
        db.query(models.StockItem)
        .order_by(models.StockItem.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_stock_item(db: Session, stock_in: schemas.StockCreate) -> models.StockItem:
    db_obj = models.StockItem(**stock_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def update_stock_item(db: Session, db_obj: models.StockItem, stock_in: schemas.StockUpdate):
    data = stock_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def delete_stock_item(db: Session, db_obj: models.StockItem):
    db.delete(db_obj)
    db.commit()


def adjust_stock(db: Session, stock_item_id: UUID, delta: float, reason: str) -> models.StockItem:
    stock_item = get_stock_item(db, stock_item_id)
    if not stock_item:
        raise ValueError("Stock item not found")

    new_quantity = stock_item.quantity + delta

    if new_quantity < 0:
        raise ValueError("Cannot reduce stock below zero")

    # Update stock quantity
    stock_item.quantity = new_quantity

    # Create transaction
    transaction = models.StockTransaction(
        stock_item_id=stock_item_id,
        delta=delta,
        reason=reason
    )
    db.add(transaction)

    db.commit()
    db.refresh(stock_item)

    return stock_item


def get_stock_transactions(db: Session, stock_item_id: UUID, skip: int = 0, limit: int = 100):
    return (
        db.query(models.StockTransaction)
        .filter(models.StockTransaction.stock_item_id == stock_item_id)
        .order_by(models.StockTransaction.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
