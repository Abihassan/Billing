from sqlalchemy import Column, String, Integer, Float, DateTime, Boolean
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.database import Base

class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    retail_price = Column(Float, nullable=False)          # (old: buy_price)
    wholesale_price = Column(Float, nullable=False)       # (old: sell_price)
    is_wholesale_only = Column(Boolean, default=False)    # ✅ new column
    stock = Column(Integer, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
