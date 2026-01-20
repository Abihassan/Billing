from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from sqlalchemy import func
from datetime import datetime

from . import models, schemas
from ..products import models as product_models
from ..customers import models as customer_models


# -------------------------------------
# FIXED INVOICE NUMBER GENERATOR
# -------------------------------------
def generate_invoice_number(db: Session) -> str:
    """Generate unique invoice number for the current date."""
    today = datetime.now().date()  # FIXED (previously was func.now().date())
    
    # Count today's invoices
    count = (
        db.query(models.Sale)
        .filter(func.date(models.Sale.created_at) == today)
        .count()
    )

    return f"INV-{today.strftime('%Y%m%d')}-{count + 1:04d}"


# -------------------------------------
# GET SINGLE SALE
# -------------------------------------
def get_sale(db: Session, sale_id: UUID) -> Optional[models.Sale]:
    return db.query(models.Sale).filter(models.Sale.id == sale_id).first()


# -------------------------------------
# LIST SALES
# -------------------------------------
def get_sales(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    pending: Optional[bool] = None,
) -> List[models.Sale]:

    query = db.query(models.Sale)

    if start_date:
        query = query.filter(models.Sale.date >= start_date)
    if end_date:
        query = query.filter(models.Sale.date <= end_date)
    if pending:
        query = query.filter(models.Sale.pending > 0)

    return (
        query.order_by(models.Sale.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# -------------------------------------
# CREATE SALE
# -------------------------------------
def create_sale(db: Session, sale_in: schemas.SaleCreate) -> models.Sale:
    if not sale_in.customer_id or not sale_in.customer_name.strip():
        raise ValueError("Customer information is required to create a sale.")

    # Fetch previous pending if any
    pending_from_customer = 0
    customer = None
    if sale_in.customer_id:
        customer = (
            db.query(customer_models.Customer)
            .filter(customer_models.Customer.id == sale_in.customer_id)
            .with_for_update()
            .first()
        )
        if customer:
            pending_from_customer = customer.pending

    # Totals
    subtotal = sum(item.quantity * item.price for item in sale_in.items)
    gst_amount = subtotal * 0.18 if sale_in.gst_enabled else 0

    # Add previous pending to new total
    total = subtotal + gst_amount + pending_from_customer
    pending = max(0, total - sale_in.paid)

    # Generate invoice number
    invoice_number = generate_invoice_number(db)

    try:
        # Create sale record
        sale = models.Sale(
            invoice_number=invoice_number,
            customer_id=sale_in.customer_id,
            customer_name=sale_in.customer_name,
            customer_type=sale_in.customer_type,
            subtotal=subtotal,
            gst=gst_amount,
            total=total,
            paid=sale_in.paid,
            pending=pending,
            payment_method=sale_in.payment_method,
        )
        db.add(sale)
        db.flush()  # Retrieve sale.id

        # Add sale items + update stock
        for item_data in sale_in.items:

            sale_item = models.SaleItem(
                sale_id=sale.id,
                product_id=item_data.product_id,
                product_name=item_data.product_name,
                quantity=item_data.quantity,
                price=item_data.price,
                line_total=item_data.quantity * item_data.price,
                price_type=getattr(item_data, "price_type", "retail"),
            )
            db.add(sale_item)

            # Update product stock
            if item_data.product_id:
                product = (
                    db.query(product_models.Product)
                    .filter(product_models.Product.id == item_data.product_id)
                    .with_for_update()
                    .first()
                )

                if product:
                    if product.stock < item_data.quantity:
                        raise ValueError(
                            f"Insufficient stock for product: {product.name}"
                        )
                    product.stock -= item_data.quantity

        # Update customer pending to reflect new pending balance
        if customer:
            customer.pending = pending

        db.commit()
        db.refresh(sale)
        return sale

    except Exception as e:
        db.rollback()
        raise e


# -------------------------------------
# DELETE SALE
# -------------------------------------
def delete_sale(db: Session, db_obj: models.Sale):
    db.delete(db_obj)
    db.commit()


# -------------------------------------
# PAY PENDING
# -------------------------------------
def pay_pending(db: Session, sale_id: UUID, amount: float) -> models.Sale:
    sale = get_sale(db, sale_id)
    if not sale:
        raise ValueError("Sale not found")

    if amount <= 0:
        raise ValueError("Amount must be positive")

    if sale.pending <= 0:
        raise ValueError("No pending amount for this sale")

    # Apply payment
    apply_amount = min(amount, sale.pending)
    sale.paid += apply_amount
    sale.pending = max(0, sale.pending - apply_amount)

    # Update customer pending too
    if sale.customer_id:
        customer = (
            db.query(customer_models.Customer)
            .filter(customer_models.Customer.id == sale.customer_id)
            .with_for_update()
            .first()
        )
        if customer:
            customer.pending = max(0, customer.pending - apply_amount)

    db.commit()
    db.refresh(sale)
    return sale
