from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class PendingOut(BaseModel):
    customer_id: UUID
    name: str
    phone: str
    pending: float
    last_invoice: Optional[str] = None
    due_since: Optional[datetime] = None

    class Config:
        from_attributes = True
