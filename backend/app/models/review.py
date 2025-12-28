from sqlalchemy import Column, Integer, Text, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class Review(Base):
    __tablename__ = "reviews"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    bookid = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))
    userid = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    rating = Column(Integer)
    comment = Column(Text)
    createdat = Column(DateTime, default=datetime.now)
    
    __table_args__ = (UniqueConstraint('bookid', 'userid', name='_book_user_review_uc'),)