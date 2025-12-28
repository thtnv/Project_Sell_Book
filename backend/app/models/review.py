from sqlalchemy import Column, Integer,String, Text, DateTime, ForeignKey, UniqueConstraint,CheckConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Review(Base):
    __tablename__ = "reviews"
    
    review_id = Column(Integer, primary_key=True, autoincrement=True)
    book_id = Column(String(10), ForeignKey("books.book_id", ondelete="CASCADE"))
    user_id = Column(String(10), ForeignKey("users.user_id", ondelete="CASCADE"))
    rating = Column(Integer)
    comment = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        CheckConstraint('rating BETWEEN 1 AND 5', name='check_rating'),
        UniqueConstraint('book_id', 'user_id', name='unique_book_user'),
    )
    
    book = relationship("Book", back_populates="reviews")
    user = relationship("User", back_populates="reviews")