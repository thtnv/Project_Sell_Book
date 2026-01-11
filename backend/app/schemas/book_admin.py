from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from decimal import Decimal
from datetime import datetime


class BookCreateAdmin(BaseModel):
    """Schema để tạo sách mới từ Admin"""
    title: str = Field(..., min_length=1, max_length=200)
    author: str = Field(..., min_length=1, max_length=100)
    publisher: Optional[str] = Field(None, max_length=100)
    publication_year: Optional[int] = Field(None, ge=1900, le=2100)
    category_id: str = Field(..., max_length=10)
    price: Decimal = Field(..., ge=0, decimal_places=2)
    stock_quantity: int = Field(default=0, ge=0)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=255)
    
    model_config = ConfigDict(from_attributes=True)


class BookUpdateAdmin(BaseModel):
    """Schema để cập nhật sách (tất cả field optional)"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    author: Optional[str] = Field(None, min_length=1, max_length=100)
    publisher: Optional[str] = Field(None, max_length=100)
    publication_year: Optional[int] = Field(None, ge=1900, le=2100)
    category_id: Optional[str] = Field(None, max_length=10)
    price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    stock_quantity: Optional[int] = Field(None, ge=0)
    description: Optional[str] = None
    cover_image_url: Optional[str] = Field(None, max_length=255)
    
    model_config = ConfigDict(from_attributes=True)


class BookResponseAdmin(BaseModel):
    """Schema response cho Admin (đầy đủ thông tin)"""
    book_id: str
    title: str
    author: str
    publisher: Optional[str]
    publication_year: Optional[int]
    category_id: str
    category_name: Optional[str]
    price: Decimal
    stock_quantity: int
    sold_quantity: int
    description: Optional[str]
    cover_image_url: Optional[str]
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    
    model_config = ConfigDict(from_attributes=True)


class BookListResponseAdmin(BaseModel):
    """Schema cho danh sách sách (Admin)"""
    total: int
    books: list[BookResponseAdmin]
    
    model_config = ConfigDict(from_attributes=True)