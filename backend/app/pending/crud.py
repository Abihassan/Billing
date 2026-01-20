from sqlalchemy.orm import Session
from typing import List
from sqlalchemy import func

from ..customers import models as customer_models
from ..sales import models as sale_models
from . import schemas

def get_pending_customers(db: Session, skip: int = 0, limit: int = 100) -> List[schemas.PendingOut]:
    # Get wholesale customers with pending > 0
    customers = (
        db.query(customer_models.Customer)
        .filter(
            customer_models.Customer.type == "wholesale",
            customer_models.Customer.pending > 0
        )
        .order_by(customer_models.Customer.pending.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    pending_list = []
    for customer in customers:
        # Get last invoice for this customer
        last_sale = (
            db.query(sale_models.Sale)
            .filter(sale_models.Sale.customer_id == customer.id)
            .order_by(sale_models.Sale.created_at.desc())
            .first()
        )
        
        pending_out = schemas.PendingOut(
            customer_id=customer.id,
            name=customer.name,
            phone=customer.phone,
            pending=customer.pending,
            last_invoice=last_sale.invoice_number if last_sale else None,
            due_since=last_sale.created_at if last_sale else None
        )
        pending_list.append(pending_out)
    
    return pending_list