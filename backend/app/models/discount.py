from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from .base import Base

class DiscountCode(Base):
    __tablename__ = "discountcodes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    vouchercode = Column(String(20), unique=True, nullable=False)
    discountpercent = Column(Numeric(5, 2))
    expirydate = Column(DateTime, nullable=False)
    createdat = Column(DateTime, default=datetime.utcnow)

class DiscountApplication(Base):
    __tablename__ = "discountapplications"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    orderid = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    discountcodeid = Column(Integer, ForeignKey("discountcodes.id", ondelete="CASCADE"))
    
    __table_args__ = (UniqueConstraint('orderid', 'discountcodeid', name='_order_discount_uc'),)