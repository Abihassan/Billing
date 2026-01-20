from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Dict, List, Optional

from ..sales import models as sale_models
from ..customers import models as customer_models
from ..products import models as product_models

def get_total_revenue(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> float:
    """Get total revenue for date range"""
    query = db.query(func.sum(sale_models.Sale.total))

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    result = query.scalar()
    return result or 0


def get_total_collected(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> float:
    """Get total collected amount for date range"""
    query = db.query(func.sum(sale_models.Sale.paid))

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    result = query.scalar()
    return result or 0


def get_total_pending(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> float:
    """Get total pending amount for date range"""
    query = db.query(func.sum(sale_models.Sale.pending))

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    result = query.scalar()
    return result or 0


def get_daily_summary(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """Get daily summary grouped by date"""
    query = db.query(
        func.date(sale_models.Sale.date).label('date'),
        func.count(sale_models.Sale.id).label('invoices'),
        func.sum(sale_models.Sale.total).label('total_sales'),
        func.sum(sale_models.Sale.paid).label('total_collected')
    ).group_by(func.date(sale_models.Sale.date))

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    results = query.order_by(func.date(sale_models.Sale.date).desc()).all()

    return [
        {
            'date': row.date,
            'invoices': row.invoices,
            'total_sales': row.total_sales or 0,
            'total_collected': row.total_collected or 0
        }
        for row in results
    ]


def get_product_performance(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """Get product performance data"""
    query = db.query(
        sale_models.SaleItem.product_name,
        func.sum(sale_models.SaleItem.quantity).label('total_quantity'),
        func.sum(sale_models.SaleItem.line_total).label('total_revenue')
    ).join(sale_models.Sale)

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    results = query.group_by(sale_models.SaleItem.product_name).all()

    return [
        {
            'product_name': row.product_name,
            'total_quantity': row.total_quantity,
            'total_revenue': row.total_revenue or 0
        }
        for row in results
    ]


def get_customer_performance(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """Aggregate sales and payments by customer"""
    query = db.query(
        sale_models.Sale.customer_id,
        sale_models.Sale.customer_name,
        func.sum(sale_models.Sale.total).label('total_sales'),
        func.sum(sale_models.Sale.paid).label('total_paid'),
        func.sum(sale_models.Sale.pending).label('total_pending')
    )

    if start_date:
        query = query.filter(sale_models.Sale.date >= start_date)
    if end_date:
        query = query.filter(sale_models.Sale.date <= end_date)

    results = query.group_by(sale_models.Sale.customer_id, sale_models.Sale.customer_name).all()

    return [
        {
            'customer_id': str(row.customer_id) if row.customer_id else None,
            'customer_name': row.customer_name,
            'total_sales': row.total_sales or 0,
            'total_paid': row.total_paid or 0,
            'total_pending': row.total_pending or 0,
        }
        for row in results
    ]


def get_summary_stats(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict:
    """Get comprehensive summary statistics"""
    return {
        'total_revenue': get_total_revenue(db, start_date, end_date),
        'total_collected': get_total_collected(db, start_date, end_date),
        'total_pending': get_total_pending(db, start_date, end_date),
        'total_invoices': db.query(sale_models.Sale).count(),
        'total_customers': db.query(customer_models.Customer).count(),
        'total_products': db.query(product_models.Product).count(),
    }


def get_revenue_report(db: Session, start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict:
    """Return revenue aggregates for the range"""
    return {
        'total_revenue': get_total_revenue(db, start_date, end_date),
        'total_collected': get_total_collected(db, start_date, end_date),
        'total_pending': get_total_pending(db, start_date, end_date),
    }