from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from .base import Base
from sqlalchemy.orm import relationship

class Contact(Base):
    __tablename__ = "contacts"
    
    contact_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(10), ForeignKey("users.user_id", ondelete="SET NULL"))
    full_name = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(String(20), default='pending')
    admin_response = Column(Text)
    sent_at = Column(DateTime, default=datetime.utcnow)
    responded_at = Column(DateTime)
    
    user = relationship("User", back_populates="contacts")