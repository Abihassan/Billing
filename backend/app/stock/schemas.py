from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class StockBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    category: str = Field(..., min_length=1, max_length=100)
    quantity: float = Field(..., ge=0)
    unit: str = Field(..., min_length=1, max_length=50)
    min_threshold: Optional[float] = None
    linked_product_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class StockCreate(StockBase):
    pass


class StockUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit: Optional[str] = None
    min_threshold: Optional[float] = None
    linked_product_id: Optional[UUID] = None

    class Config:
        from_attributes = True


class StockOut(StockBase):
    id: UUID
    created_at: datetime


class AdjustStock(BaseModel):
    delta: float
    reason: str = Field(..., min_length=1, max_length=255)


class StockTransactionOut(BaseModel):
    id: UUID
    stock_item_id: UUID
    delta: float
    reason: str
    related_sale_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
