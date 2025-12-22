from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from .base import Base

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    fullname = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password = Column(String(255), nullable=False)
    phone = Column(String(15))
    address = Column(String(255))
    role = Column(String(20), default="customer")
    createdat = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="user")
    cartitems = relationship("Cart", back_populates="user")