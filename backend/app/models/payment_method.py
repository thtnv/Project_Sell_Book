from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class PaymentMethod(Base):
    __tablename__ = "payment_methods"
    
    payment_method_id = Column(String(10), primary_key=True)
    method_name = Column(String(100), unique=True, nullable=False)
    description = Column(Text)
    status = Column(String(20), default='active')
    created_at = Column(DateTime, default=datetime.utcnow)
    
    orders = relationship("Order", back_populates="payment_method")