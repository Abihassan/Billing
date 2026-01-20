from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from . import models, schemas

def get_customer(db: Session, customer_id: UUID) -> Optional[models.Customer]:
    return db.query(models.Customer).filter(models.Customer.id == customer_id).first()

def get_customers(db: Session, skip: int = 0, limit: int = 100, customer_type: Optional[str] = None) -> List[models.Customer]:
    query = db.query(models.Customer)
    
    if customer_type:
        query = query.filter(models.Customer.type == customer_type)
    
    return (
        query.order_by(models.Customer.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def create_customer(db: Session, customer_in: schemas.CustomerCreate) -> models.Customer:
    db_obj = models.Customer(**customer_in.dict())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def update_customer(db: Session, db_obj: models.Customer, customer_in: schemas.CustomerUpdate):
    data = customer_in.dict(exclude_unset=True)
    for field, value in data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj

def delete_customer(db: Session, db_obj: models.Customer):
    db.delete(db_obj)
    db.commit()

def apply_payment(db: Session, customer_id: UUID, payment_in: schemas.CustomerPaymentCreate) -> models.Customer:
    customer = get_customer(db, customer_id)
    if not customer:
        raise ValueError("Customer not found")
    
    # Update customer pending amount
    customer.pending = max(0, customer.pending - payment_in.amount)
    
    # Create payment record
    payment = models.CustomerPayment(
        customer_id=customer_id,
        amount=payment_in.amount,
        method=payment_in.method,
        note=payment_in.note
    )
    db.add(payment)
    db.commit()
    db.refresh(customer)
    
    return customer

def get_customer_payments(db: Session, customer_id: UUID, skip: int = 0, limit: int = 100) -> List[models.CustomerPayment]:
    return (
        db.query(models.CustomerPayment)
        .filter(models.CustomerPayment.customer_id == customer_id)
        .order_by(models.CustomerPayment.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )