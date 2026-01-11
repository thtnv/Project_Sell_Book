from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional

class UserProfileUpdate(BaseModel):
    """Schema để customer tự cập nhật profile"""
    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class UserProfileResponse(BaseModel):
    """Schema response profile"""
    user_id: str
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    
    model_config = ConfigDict(from_attributes=True)


# ====== CẬP NHẬT ROUTER: backend/app/routers/user.py ======

# Thêm vào đầu file (sau các import hiện tại):




