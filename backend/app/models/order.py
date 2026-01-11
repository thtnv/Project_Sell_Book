from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    
    order_id = Column(String(10), primary_key=True)
    user_id = Column(String(10), ForeignKey("users.user_id", ondelete="CASCADE"))
    total_amount = Column(Numeric(10, 2), nullable=False)
    status_id = Column(String(10), ForeignKey("order_status.status_id", ondelete="SET NULL"))
    shipping_address = Column(String(255))
    payment_method_id = Column(String(10), ForeignKey("payment_methods.payment_method_id", ondelete="SET NULL"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('total_amount >= 0', name='check_total_amount'),
    )
    
<<<<<<< HEAD
    user = relationship("User", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order")
    discount_applications = relationship("DiscountApplication", back_populates="order")
    payment_method = relationship("PaymentMethod", back_populates="orders")
=======
    # Relationships
    user = relationship("User", back_populates="orders")
    status = relationship("OrderStatus", back_populates="orders")
    order_details = relationship("OrderDetail", back_populates="order", cascade="all, delete-orphan")
    discount_applications = relationship("DiscountApplication", back_populates="order", cascade="all, delete-orphan")
    payment_method = relationship("PaymentMethod", back_populates="orders")
>>>>>>> feature/final
