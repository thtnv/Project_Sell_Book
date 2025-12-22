from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    totalprice = Column(Numeric(10, 2), nullable=False)
    orderstatus = Column(String(20), default="pending")
    paymentstatus = Column(String(20), default="unpaid")
    shippingaddress = Column(String(255), nullable=False)
    createdat = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('totalprice >= 0', name='check_totalprice_pos'),
    )

    user = relationship("User", back_populates="orders")
    details = relationship("OrderDetail", back_populates="order")