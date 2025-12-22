from sqlalchemy import Column, Integer, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base

class OrderDetail(Base):
    __tablename__ = "orderdetails"
    id = Column(Integer, primary_key=True, autoincrement=True)
    orderid = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"))
    bookid = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)
    priceatpurchase = Column(Numeric(10, 2), nullable=False)

    order = relationship("Order", back_populates="details")
    book = relationship("Book", back_populates="orderitems")