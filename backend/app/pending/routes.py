from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from . import schemas, crud
from ..utils import get_db

router = APIRouter(prefix="/api/pending", tags=["pending"])

@router.get("/", response_model=List[schemas.PendingOut])
def list_pending_customers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of wholesale customers with pending payments"""
    return crud.get_pending_customers(db, skip=skip, limit=limit)