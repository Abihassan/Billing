from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid

from ..database import Base

class Customer(Base):
    __tablename__ = "customers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(20), nullable=False)
    type = Column(String(20), nullable=False, default="retail")  # retail, wholesale
    pending = Column(Float, nullable=False, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class CustomerPayment(Base):
    __tablename__ = "customer_payments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    customer_id = Column(UUID(as_uuid=True), ForeignKey("customers.id"), nullable=False)
    amount = Column(Float, nullable=False)
    method = Column(String(50), nullable=False, default="cash")  # cash, card, upi, credit
    note = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    customer = relationship("Customer")