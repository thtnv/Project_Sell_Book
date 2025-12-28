from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, CheckConstraint, Numeric
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Book(Base):
    __tablename__ = "books"
    
    book_id = Column(String(10), primary_key=True)
    title = Column(String(200), nullable=False)
    author = Column(String(100), nullable=False)
    publisher = Column(String(100))
    publication_year = Column(Integer)
    category_id = Column(String(10), ForeignKey("categories.category_id", ondelete="CASCADE"))
    price = Column(Numeric(10, 2), nullable=False)
    stock_quantity = Column(Integer, default=0)
    sold_quantity = Column(Integer, default=0)
    description = Column(Text)
    cover_image_url = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('price >= 0', name='check_price'),
        CheckConstraint('stock_quantity >= 0', name='check_stock'),
        CheckConstraint('sold_quantity >= 0', name='check_sold'),
    )
    
    category = relationship("Category", back_populates="books")
    order_details = relationship("OrderDetail", back_populates="book")
    reviews = relationship("Review", back_populates="book")
    favorites = relationship("Favorite", back_populates="book")