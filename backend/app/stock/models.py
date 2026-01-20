from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..database import Base


class StockItem(Base):
    __tablename__ = "stock_items"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    quantity = Column(Float, nullable=False, default=0)
    unit = Column(String(50), nullable=False, default="pcs")
    min_threshold = Column(Float, nullable=True)
    linked_product_id = Column(UUID(as_uuid=True), ForeignKey("products.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # FIX: Add relationship back
    transactions = relationship(
        "StockTransaction",
        back_populates="stock_item",
        cascade="all, delete"
    )


class StockTransaction(Base):
    __tablename__ = "stock_transactions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    stock_item_id = Column(UUID(as_uuid=True), ForeignKey("stock_items.id"), nullable=False)
    delta = Column(Float, nullable=False)
    reason = Column(String(255), nullable=False)
    related_sale_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    stock_item = relationship("StockItem", back_populates="transactions")
