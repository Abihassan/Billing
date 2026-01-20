import csv
from io import StringIO
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from . import schemas, crud
from ..utils import get_db

router = APIRouter(prefix="/api/customers", tags=["customers"])

@router.get("/export", tags=["Export"])
def export_customers_csv(db: Session = Depends(get_db)):
    """Download all customers as CSV."""
    customers = crud.get_customers(db, skip=0, limit=100000)

    # Create CSV in memory
    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "id",
        "name",
        "phone",
        "type",
        "pending",
        "created_at"
    ])

    # Rows
    for c in customers:
        writer.writerow([
            str(c.id),
            c.name,
            c.phone,
            c.type,
            c.pending,
            c.created_at.isoformat() if c.created_at else "",
        ])

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=customers_export.csv"},
    )

@router.get("/", response_model=List[schemas.CustomerOut])
def list_customers(
    skip: int = 0, 
    limit: int = 100, 
    type: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return crud.get_customers(db, skip=skip, limit=limit, customer_type=type)

@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def read_customer(customer_id: UUID, db: Session = Depends(get_db)):
    customer = crud.get_customer(db, customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return customer

@router.post("/", response_model=schemas.CustomerOut, status_code=201)
def create_customer(customer_in: schemas.CustomerCreate, db: Session = Depends(get_db)):
    return crud.create_customer(db, customer_in)

@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(customer_id: UUID, customer_in: schemas.CustomerUpdate, db: Session = Depends(get_db)):
    db_obj = crud.get_customer(db, customer_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    return crud.update_customer(db, db_obj, customer_in)

@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: UUID, db: Session = Depends(get_db)):
    db_obj = crud.get_customer(db, customer_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Customer not found")
    crud.delete_customer(db, db_obj)
    return Response(status_code=204)

@router.post("/{customer_id}/payments", response_model=schemas.CustomerOut)
def accept_payment(customer_id: UUID, payment_in: schemas.CustomerPaymentCreate, db: Session = Depends(get_db)):
    try:
        return crud.apply_payment(db, customer_id, payment_in)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{customer_id}/payments", response_model=List[schemas.CustomerPaymentOut])
def get_customer_payments(customer_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_customer_payments(db, customer_id, skip=skip, limit=limit)