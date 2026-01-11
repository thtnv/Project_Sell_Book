from pydantic import BaseModel, Field, ConfigDict
from typing import Optional


class CategoryCreate(BaseModel):
    """Schema để tạo thể loại mới"""
    category_id: str = Field(..., min_length=1, max_length=10, description="Mã thể loại")
    category_name: str = Field(..., min_length=1, max_length=50, description="Tên thể loại")
    
    model_config = ConfigDict(from_attributes=True)


class CategoryUpdate(BaseModel):
    """Schema để cập nhật thể loại"""
    category_name: Optional[str] = Field(None, min_length=1, max_length=50, description="Tên thể loại")
    
    model_config = ConfigDict(from_attributes=True)


class CategoryResponse(BaseModel):
    """Schema response cơ bản cho thể loại"""
    category_id: str
    category_name: str
    
    model_config = ConfigDict(from_attributes=True)


class CategoryDetailResponse(BaseModel):
    """Schema response chi tiết cho thể loại (bao gồm thống kê)"""
    category_id: str
    category_name: str
    book_count: int = Field(default=0, description="Số lượng sách khác nhau")
    total_stock: int = Field(default=0, description="Tổng số lượng tồn kho")
    
    model_config = ConfigDict(from_attributes=True)


class CategoryListResponse(BaseModel):
    """Schema cho danh sách thể loại"""
    total: int
    categories: list[CategoryDetailResponse]
    
    model_config = ConfigDict(from_attributes=True)