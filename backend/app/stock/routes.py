import csv
from io import StringIO
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from . import schemas, crud
from ..utils import get_db

router = APIRouter(prefix="/api/stock", tags=["stock"])

@router.get("/export", tags=["Export"])
def export_stock_csv(db: Session = Depends(get_db)):
    """Download all stock items as CSV."""
    stock_items = crud.get_stock_items(db, skip=0, limit=100000)

    # Create CSV in memory
    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "id",
        "name",
        "category",
        "quantity",
        "unit",
        "min_threshold",
        "linked_product_id",
        "created_at"
    ])

    # Rows
    for item in stock_items:
        writer.writerow([
            str(item.id),
            item.name,
            item.category,
            item.quantity,
            item.unit,
            item.min_threshold,
            str(item.linked_product_id) if item.linked_product_id else "",
            item.created_at.isoformat() if item.created_at else "",
        ])

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=stock_export.csv"},
    )

@router.get("/", response_model=List[schemas.StockOut])
def list_stock_items(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_stock_items(db, skip=skip, limit=limit)

@router.get("/{stock_item_id}", response_model=schemas.StockOut)
def read_stock_item(stock_item_id: UUID, db: Session = Depends(get_db)):
    stock_item = crud.get_stock_item(db, stock_item_id)
    if not stock_item:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return stock_item

@router.post("/", response_model=schemas.StockOut, status_code=201)
def create_stock_item(stock_in: schemas.StockCreate, db: Session = Depends(get_db)):
    return crud.create_stock_item(db, stock_in)

@router.put("/{stock_item_id}", response_model=schemas.StockOut)
def update_stock_item(stock_item_id: UUID, stock_in: schemas.StockUpdate, db: Session = Depends(get_db)):
    db_obj = crud.get_stock_item(db, stock_item_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Stock item not found")
    return crud.update_stock_item(db, db_obj, stock_in)

@router.delete("/{stock_item_id}", status_code=204)
def delete_stock_item(stock_item_id: UUID, db: Session = Depends(get_db)):
    db_obj = crud.get_stock_item(db, stock_item_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Stock item not found")
    crud.delete_stock_item(db, db_obj)
    return Response(status_code=204)

@router.post("/{stock_item_id}/adjust", response_model=schemas.StockOut)
def adjust_stock_quantity(stock_item_id: UUID, adjust_data: schemas.AdjustStock, db: Session = Depends(get_db)):
    try:
        return crud.adjust_stock(db, stock_item_id, adjust_data.delta, adjust_data.reason)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{stock_item_id}/transactions", response_model=List[schemas.StockTransactionOut])
def get_stock_transactions(stock_item_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_stock_transactions(db, stock_item_id, skip=skip, limit=limit)