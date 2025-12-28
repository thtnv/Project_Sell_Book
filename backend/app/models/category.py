from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class Category(Base):
    __tablename__ = "categories"
    
    category_id = Column(String(10), primary_key=True)
    category_name = Column(String(50), unique=True, nullable=False)
    
    books = relationship("Book", back_populates="category")