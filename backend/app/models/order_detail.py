from sqlalchemy import Column, Integer,String, Numeric, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base

class OrderDetail(Base):
    __tablename__ = "order_details"
    
    detail_id = Column(Integer, primary_key=True, autoincrement=True)
    order_id = Column(String(10), ForeignKey("orders.order_id", ondelete="CASCADE"))
    book_id = Column(String(10), ForeignKey("books.book_id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(10, 2), nullable=False)
    
    __table_args__ = (
        CheckConstraint('quantity > 0', name='check_quantity'),
        CheckConstraint('unit_price >= 0', name='check_unit_price'),
    )
    
    order = relationship("Order", back_populates="order_details")
    book = relationship("Book", back_populates="order_details")