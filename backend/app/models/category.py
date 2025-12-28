from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from .base import Base

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    categoryname = Column(String(50), unique=True, nullable=False,unique=True)

    books = relationship("Book", back_populates="category")