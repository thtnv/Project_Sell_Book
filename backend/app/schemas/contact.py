from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


# Schema để tạo liên hệ mới
class ContactCreate(BaseModel):
    user_id: Optional[str] = None  # Tự động gán nếu đã đăng nhập
    full_name: Optional[str] = Field(None, max_length=100)
    email: Optional[str] = Field(None, max_length=150)
    subject: str = Field(..., min_length=1, max_length=200)
    message: str = Field(..., min_length=1)
    
    model_config = ConfigDict(from_attributes=True)


# Schema để Admin phản hồi
class ContactReply(BaseModel):
    admin_response: str = Field(..., min_length=1)
    
    model_config = ConfigDict(from_attributes=True)


# Schema response
class ContactResponse(BaseModel):
    contact_id: int
    user_id: Optional[str] = None
    full_name: str
    email: str
    subject: str
    message: str
    status: str  # 'pending' or 'resolved'
    admin_response: Optional[str] = None
    sent_at: Optional[datetime] = None
    responded_at: Optional[datetime] = None
    
    model_config = ConfigDict(from_attributes=True)


# Schema cho danh sách liên hệ (Admin)
class ContactListResponse(BaseModel):
    total: int
    contacts: list[ContactResponse]
    
    model_config = ConfigDict(from_attributes=True)


# Schema cho thông báo của user (chỉ lấy những tin đã được admin trả lời)
class NotificationResponse(BaseModel):
    contact_id: int
    subject: str
    message: str
    admin_response: str
    responded_at: datetime
    
    model_config = ConfigDict(from_attributes=True)