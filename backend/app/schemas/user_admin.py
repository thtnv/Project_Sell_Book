from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

# Schema cho tạo user mới (Admin)
class UserCreateAdmin(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    phone: Optional[str] = Field(None, max_length=15)
    address: Optional[str] = Field(None, max_length=255)
    role: str = Field(default='customer')

# Schema cho cập nhật user (Admin)
class UserUpdateAdmin(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: Optional[EmailStr] = None
    password: Optional[str] = Field(None, min_length=6)
    phone: Optional[str] = Field(None, max_length=15)
    address: Optional[str] = Field(None, max_length=255)
    role: Optional[str] = None

# Schema response cho Admin
class UserResponseAdmin(BaseModel):
    user_id: str
    full_name: str
    email: str
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str
    created_at: datetime

    model_config = {"from_attributes": True}

# Schema cho danh sách users
class UserListResponseAdmin(BaseModel):
    total: int
    users: list[UserResponseAdmin]

    model_config = {"from_attributes": True}