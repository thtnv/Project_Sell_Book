from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from datetime import datetime
from .base import Base

class Contact(Base):
    __tablename__ = "contacts"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    userid = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    fullname = Column(String(100), nullable=False)
    email = Column(String(150), nullable=False)
    subject = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    status = Column(String(20), default="unprocessed")
    adminreply = Column(Text, nullable=True)
    sentdate = Column(DateTime, default=datetime.now)
    replydate = Column(DateTime, nullable=True)