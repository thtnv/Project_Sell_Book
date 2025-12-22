from sqlalchemy import Column, Integer, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from .base import Base

class Cart(Base):
    __tablename__ = "cart"
    id = Column(Integer, primary_key=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    bookid = Column(Integer, ForeignKey("books.id", ondelete="CASCADE"))
    quantity = Column(Integer, nullable=False)

    __table_args__ = (CheckConstraint('quantity > 0', name='check_cart_qty'),)

    user = relationship("User", back_populates="cartitems")