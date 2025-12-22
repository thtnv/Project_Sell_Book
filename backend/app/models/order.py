from sqlalchemy import Column, Integer, String, Decimal, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    totalprice = Column(Decimal(10, 2), nullable=False)
    orderstatus = Column(String(20), default="pending")
    paymentstatus = Column(String(20), default="unpaid")
    shippingaddress = Column(String(255), nullable=False)
    createdat = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="orders")
    details = relationship("OrderDetail", back_populates="order")