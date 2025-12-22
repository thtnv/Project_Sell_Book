from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Book(Base):
    __tablename__ = "books"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    publisher = Column(String(100))
    publishyear = Column(Integer)
    categoryid = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"))
    price = Column(Numeric(10, 2), nullable=False)
    stock = Column(Integer, default=0)
    description = Column(Text)
    imageurl = Column(String(255))
    createdat = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price_pos'),
        CheckConstraint('stock >= 0', name='check_stock_pos'),
    )

    category = relationship("Category", back_populates="books")
    orderitems = relationship("OrderDetail", back_populates="book")