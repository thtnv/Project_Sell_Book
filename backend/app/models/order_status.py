from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from .base import Base

class OrderStatus(Base):
    __tablename__ = "order_status"
    
    status_id = Column(String(10), primary_key=True)
    status_name = Column(String(50), unique=True, nullable=False)
    
    # Relationship
    orders = relationship("Order", back_populates="status")