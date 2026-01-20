# app/products/routes.py

import csv
from io import StringIO
from uuid import UUID
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from app.utils import get_db
from . import crud, schemas

router = APIRouter(prefix="/api/products", tags=["Products"])

# ---------------------------------------------------
# EXPORT CSV
# ---------------------------------------------------
@router.get("/export")
def export_products_csv(db: Session = Depends(get_db)):
    products = crud.get_products(db, skip=0, limit=100000)

    # Create CSV
    output = StringIO()
    writer = csv.writer(output)

    writer.writerow(["id", "name", "category", "retail_price", "wholesale_price", "is_wholesale_only", "stock", "created_at"])

    for p in products:
        writer.writerow([
            str(p.id),
            p.name,
            p.category,
            p.retail_price,
            p.wholesale_price,
            p.is_wholesale_only,
            p.stock,
            p.created_at.isoformat() if p.created_at else "",
        ])

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=products_export.csv"},
    )

# ---------------------------------------------------
# GET ALL
# ---------------------------------------------------
@router.get("/", response_model=List[schemas.ProductOut])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_products(db, skip=skip, limit=limit)

# ---------------------------------------------------
# GET ONE
# ---------------------------------------------------
@router.get("/{product_id}", response_model=schemas.ProductOut)
def read_product(product_id: UUID, db: Session = Depends(get_db)):
    product = crud.get_product(db, product_id)
    if not product:
        raise HTTPException(404, "Product not found")
    return product

# ---------------------------------------------------
# CREATE
# ---------------------------------------------------
# In CREATE product validation:
@router.post("/", response_model=schemas.ProductOut, status_code=201)
def create_product(product_in: schemas.ProductCreate, db: Session = Depends(get_db)):
    if product_in.wholesale_price > product_in.retail_price:
        raise HTTPException(400, "wholesale_price must be <= retail_price")
    return crud.create_product(db, product_in)


# ---------------------------------------------------
# UPDATE
# ---------------------------------------------------
@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: UUID, product_in: schemas.ProductUpdate, db: Session = Depends(get_db)):
    db_obj = crud.get_product(db, product_id)
    if not db_obj:
        raise HTTPException(404, "Product not found")
    return crud.update_product(db, db_obj, product_in)

# ---------------------------------------------------
# DELETE
# ---------------------------------------------------
@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: UUID, db: Session = Depends(get_db)):
    db_obj = crud.get_product(db, product_id)
    if not db_obj:
        raise HTTPException(404, "Product not found")

    crud.delete_product(db, db_obj)
    return Response(status_code=204)
