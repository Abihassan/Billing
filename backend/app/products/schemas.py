from pydantic import BaseModel, Field, constr
from typing import Optional
from uuid import UUID
from datetime import datetime

class ProductBase(BaseModel):
    name: constr(strip_whitespace=True, min_length=1, max_length=255)
    category: constr(strip_whitespace=True, min_length=1, max_length=100)
    retail_price: float = Field(..., gt=0)       # renamed
    wholesale_price: float = Field(..., gt=0)    # renamed
    is_wholesale_only: bool = False              # new field
    stock: int = Field(..., ge=0)

    class Config:
        from_attributes = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str]
    category: Optional[str]
    retail_price: Optional[float]
    wholesale_price: Optional[float]
    is_wholesale_only: Optional[bool]
    stock: Optional[int]

    class Config:
        from_attributes = True

class ProductOut(ProductBase):
    id: UUID
    created_at: datetime
