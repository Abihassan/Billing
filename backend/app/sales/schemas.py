from pydantic import BaseModel, Field
from typing import List, Optional
from uuid import UUID
from datetime import datetime

# ---------------------- SALE ITEMS ---------------------- #

class SaleItemBase(BaseModel):
    product_id: Optional[UUID] = None
    product_name: str
    quantity: int = Field(..., gt=0)
    price: float = Field(..., gt=0)
    line_total: float = Field(..., gt=0)

    class Config:
        from_attributes = True


class SaleItemCreate(SaleItemBase):
    pass


class SaleItemOut(SaleItemBase):
    id: UUID
    sale_id: UUID


# ---------------------- SALES ---------------------- #

class SaleBase(BaseModel):
    customer_id: Optional[UUID] = None
    customer_name: str
    customer_type: str = Field(..., pattern="^(retail|wholesale)$")
    paid: float = Field(..., ge=0)
    payment_method: str = Field(..., pattern="^(cash|card|upi|credit)$")

    class Config:
        from_attributes = True


class SaleCreate(BaseModel):
    customer_id: Optional[UUID] = None
    customer_name: str
    customer_type: str = Field(..., pattern="^(retail|wholesale)$")
    items: List[SaleItemCreate]
    gst_enabled: bool = False
    paid: float = Field(..., ge=0)
    payment_method: str = Field(..., pattern="^(cash|card|upi|credit)$")


class SaleOut(BaseModel):
    id: UUID
    invoice_number: str
    date: datetime
    created_at: datetime

    customer_id: Optional[UUID]
    customer_name: str
    customer_type: str
    payment_method: str

    subtotal: float
    gst: float
    total: float
    paid: float
    pending: float

    items: List[SaleItemOut]

    class Config:
        from_attributes = True


# NEW: Pay request
class PayRequest(BaseModel):
    amount: float = Field(..., gt=0)
