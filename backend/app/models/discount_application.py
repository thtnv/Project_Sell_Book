from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey,UniqueConstraint
from sqlalchemy.orm import relationship
from .base import Base
class DiscountApplication(Base):
    __tablename__ = "discount_applications"
    
    application_id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(10), ForeignKey("orders.order_id", ondelete="CASCADE"))
    discount_id = Column(String(10), ForeignKey("discounts.discount_id"))
    
    __table_args__ = (
        UniqueConstraint('order_id', 'discount_id', name='unique_order_discount'),
    )
    
    order = relationship("Order", back_populates="discount_applications")
    discount = relationship("Discount", back_populates="discount_applications")

