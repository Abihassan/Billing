from pydantic import BaseModel, Field, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime

class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    phone: str = Field(..., min_length=1, max_length=20)
    type: str = Field(..., pattern="^(retail|wholesale)$")

    class Config:
        from_attributes = True

class CustomerCreate(CustomerBase):
    pass

class CustomerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    type: Optional[str] = None

    class Config:
        from_attributes = True

class CustomerOut(CustomerBase):
    id: UUID
    pending: float
    created_at: datetime

class CustomerPaymentBase(BaseModel):
    amount: float = Field(..., gt=0)
    method: str = Field(..., pattern="^(cash|card|upi|credit)$")
    note: Optional[str] = None

    class Config:
        from_attributes = True

class CustomerPaymentCreate(CustomerPaymentBase):
    pass

class CustomerPaymentOut(CustomerPaymentBase):
    id: UUID
    customer_id: UUID
    created_at: datetime
