from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..database import Base

class Sale(Base):
    __tablename__ = "sales"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    invoice_number = Column(String(100), nullable=False, unique=True, index=True)
    date = Column(DateTime(timezone=True), server_default=func.now())
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=True)  # <-- changed nullable=False to True
    customer_name = Column(String(255), nullable=False)
    customer_type = Column(String(20), nullable=False)
    subtotal = Column(Float, nullable=False)
    gst = Column(Float, nullable=False, default=0)
    total = Column(Float, nullable=False)
    paid = Column(Float, nullable=False, default=0)
    pending = Column(Float, nullable=False, default=0)
    payment_method = Column(String(50), nullable=False, default="cash")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    items = relationship("SaleItem", back_populates="sale", cascade="all, delete-orphan")

class SaleItem(Base):
    __tablename__ = "sale_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    sale_id = Column(UUID(as_uuid=True), ForeignKey("sales.id"), nullable=False)
    product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    product_name = Column(String(255), nullable=False)
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    line_total = Column(Float, nullable=False)
    price_type = Column(String(20), nullable=False, default="retail")  # "retail" or "wholesale"
    
    sale = relationship("Sale", back_populates="items")
