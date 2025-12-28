from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship

class Favorite(Base):
    __tablename__ = "favorites"
    
    favorite_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(10), ForeignKey("users.user_id", ondelete="CASCADE"))
    book_id = Column(String(10), ForeignKey("books.book_id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    __table_args__ = (
        UniqueConstraint('user_id', 'book_id', name='unique_user_book'),
    )
    
    user = relationship("User", back_populates="favorites")
    book = relationship("Book", back_populates="favorites")
