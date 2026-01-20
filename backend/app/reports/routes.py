from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Optional

from . import services
from ..utils import get_db

router = APIRouter(prefix="/api/reports", tags=["reports"])

# Legacy endpoints (kept for compatibility)
@router.get("/summary")
def get_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get summary statistics for date range"""
    return services.get_summary_stats(db, start_date, end_date)


@router.get("/daily")
def get_daily_summary_legacy(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get daily summary for date range (legacy)"""
    return services.get_daily_summary(db, start_date, end_date)


@router.get("/sales")
def get_sales_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get sales totals for date range"""
    return {
        'total_revenue': services.get_total_revenue(db, start_date, end_date),
        'total_collected': services.get_total_collected(db, start_date, end_date),
        'total_pending': services.get_total_pending(db, start_date, end_date)
    }


@router.get("/products")
def get_product_performance_legacy(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get product performance report for date range (legacy)"""
    return services.get_product_performance(db, start_date, end_date)


# New endpoints per frontend expectations
@router.get("/daily-summary")
def get_daily_summary(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Get daily summary for date range"""
    return services.get_daily_summary(db, start_date, end_date)


@router.get("/product-performance")
def product_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return services.get_product_performance(db, start_date, end_date)


@router.get("/revenue")
def revenue_report(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return services.get_revenue_report(db, start_date, end_date)


@router.get("/customer-performance")
def customer_performance(
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    return services.get_customer_performance(db, start_date, end_date)