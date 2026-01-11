from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime


class RegisterUserSchema(BaseModel):
    username: str
    phone: Optional[str] = None
    address: Optional[str] = None
    email: EmailStr
    password: str = Field(..., min_length=6)

    model_config = ConfigDict(from_attributes=True)


class RegisterResponseSchema(BaseModel):
    id: str
    fullname: str
    phone: Optional[str] = None
    address: Optional[str] = None
    email: EmailStr
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class LoginSchema(BaseModel):
    phone: str  # Sử dụng phone để đăng nhập
    password: str = Field(..., min_length=6)

    model_config = ConfigDict(from_attributes=True)


class SocialLoginRequest(BaseModel):
    provider: str  # 'google' hoặc 'facebook'
    token: str  # Token nhận được từ frontend


class UserInfoSchema(BaseModel):
    """Thông tin user trong response login"""

    id: str
    fullname: str
    email: EmailStr
    phone: Optional[str] = None
    address: Optional[str] = None
    role: str  # 'admin' hoặc 'customer'
    created_at: Optional[str] = None  # ISO format string

    model_config = ConfigDict(from_attributes=True)


class TokenSchema(BaseModel):
    """Schema response khi đăng nhập thành công"""

    access_token: str
    token_type: str = "bearer"
    user: dict  # Thông tin user

    model_config = ConfigDict(from_attributes=True)


class UserProfileSchema(BaseModel):
    id: str
    fullname: str
    phone: Optional[str] = None
    address: Optional[str] = None
    email: EmailStr
    role: str
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)


class UpdateProfileSchema(BaseModel):
    """Schema để cập nhật profile"""

    full_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
