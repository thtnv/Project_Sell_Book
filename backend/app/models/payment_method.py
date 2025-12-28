from sqlalchemy import Column, Integer, String, Text, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class PaymentMethod(Base):
    __tablename__ = "paymentmethods"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    methodname = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    createdat = Column(DateTime, default=datetime.now)
    
    orders = relationship("Order", back_populates="payment_method")