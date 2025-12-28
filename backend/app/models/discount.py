from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint,CheckConstraint
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship
class DiscountCode(Base):
    __tablename__ = "discounts"
    
    discount_id = Column(String(10), primary_key=True)
    voucher_code = Column(String(20), unique=True, nullable=False)
    discount_percentage = Column(Numeric(5, 2))
    expiry_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('discount_percentage BETWEEN 1 AND 100', name='check_percentage'),
    )
    
    discount_applications = relationship("DiscountApplication", back_populates="discount")