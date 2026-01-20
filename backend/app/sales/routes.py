import csv
from io import StringIO
from fastapi import APIRouter, HTTPException, Depends, Response
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from . import schemas, crud
from ..utils import get_db

router = APIRouter(prefix="/api/sales", tags=["sales"])


@router.get("/export", tags=["Export"])
def export_sales_csv(db: Session = Depends(get_db)):
    """Download all sales as CSV."""
    sales = crud.get_sales(db, skip=0, limit=100000)

    # Create CSV in memory
    output = StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow(
        [
            "invoice_number",
            "date",
            "customer_name",
            "customer_type",
            "subtotal",
            "gst",
            "total",
            "paid",
            "pending",
            "payment_method",
            "created_at",
        ]
    )

    # Rows
    for sale in sales:
        writer.writerow(
            [
                sale.invoice_number,
                sale.date.isoformat() if sale.date else "",
                sale.customer_name,
                sale.customer_type,
                sale.subtotal,
                sale.gst,
                sale.total,
                sale.paid,
                sale.pending,
                sale.payment_method,
                sale.created_at.isoformat() if sale.created_at else "",
            ]
        )

    output.seek(0)

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=sales_export.csv"},
    )


@router.get("/", response_model=List[schemas.SaleOut])
def list_sales(
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    pending: Optional[bool] = None,
    db: Session = Depends(get_db),
):
    return crud.get_sales(
        db, skip=skip, limit=limit, start_date=start_date, end_date=end_date, pending=pending
    )


@router.get("/{sale_id}", response_model=schemas.SaleOut)
def read_sale(sale_id: UUID, db: Session = Depends(get_db)):
    sale = crud.get_sale(db, sale_id)
    if not sale:
        raise HTTPException(status_code=404, detail="Sale not found")
    return sale


@router.post("/", response_model=schemas.SaleOut, status_code=201)
def create_sale(sale_in: schemas.SaleCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_sale(db, sale_in)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception:
        raise HTTPException(status_code=500, detail="Failed to create sale")


# NEW: pay pending for an invoice
@router.patch("/{sale_id}/pay", response_model=schemas.SaleOut)
def pay_sale_pending(sale_id: UUID, pay_in: schemas.PayRequest, db: Session = Depends(get_db)):
    try:
        return crud.pay_pending(db, sale_id, pay_in.amount)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{sale_id}", status_code=204)
def delete_sale(sale_id: UUID, db: Session = Depends(get_db)):
    db_obj = crud.get_sale(db, sale_id)
    if not db_obj:
        raise HTTPException(status_code=404, detail="Sale not found")
    crud.delete_sale(db, db_obj)
    return Response(status_code=204)