# backend/app/schemas/order.py
from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from decimal import Decimal


class OrderItemCreate(BaseModel):
    """Schema cho item trong đơn hàng"""
    book_id: str = Field(..., description="ID của sách")
    quantity: int = Field(..., gt=0, description="Số lượng")
    
    model_config = ConfigDict(from_attributes=True)


class OrderCreate(BaseModel):
    """Schema để tạo đơn hàng mới"""
    user_id: Optional[str] = None  # Sẽ được gán từ current_user
    shipping_address: str = Field(..., min_length=5, description="Địa chỉ giao hàng")
    payment_method_id: str = Field(..., description="ID phương thức thanh toán")
    voucher_code: Optional[str] = Field(None, description="Mã giảm giá (nếu có)")
    items: List[OrderItemCreate] = Field(..., min_length=1, description="Danh sách sách trong đơn")
    
    model_config = ConfigDict(from_attributes=True)


class BookInOrderDetail(BaseModel):
    """Thông tin sách trong order detail"""
    book_id: str
    title: str
    cover_image_url: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderDetailResponse(BaseModel):
    """Schema cho chi tiết item trong đơn hàng"""
    detail_id: int
    book_id: str
    quantity: int
    unit_price: Decimal
    book: Optional[BookInOrderDetail] = None
    
    model_config = ConfigDict(from_attributes=True)


class OrderResponse(BaseModel):
    """Schema response chi tiết đơn hàng"""
    order_id: str
    user_id: str
    total_amount: Decimal
    status_id: str
    order_status: str
    shipping_address: str
    payment_method_id: str
    payment_method_name: Optional[str] = None
    created_at: datetime
    order_details: List[OrderDetailResponse] = []
    
    model_config = ConfigDict(from_attributes=True)


class UserOrderHistoryResponse(BaseModel):
    """Schema cho lịch sử đơn hàng của user"""
    total: int
    orders: List[OrderResponse]
    
    model_config = ConfigDict(from_attributes=True)


class OrderStatusUpdate(BaseModel):
    """Schema để cập nhật trạng thái đơn hàng"""
    new_status: str = Field(..., description="Trạng thái mới: confirmed, shipping, completed, cancelled")
    
    model_config = ConfigDict(from_attributes=True)


class OrderCancelResponse(BaseModel):
    """Schema response khi hủy đơn"""
    message: str
    order_id: str
    order_status: str
    
    model_config = ConfigDict(from_attributes=True)