from pydantic import BaseModel, Field, ConfigDict
from typing import Optional
from datetime import datetime


class ReviewBase(BaseModel):
    rating: int = Field(..., ge=1, le=5, description="Điểm đánh giá từ 1-5 sao")
    comment: Optional[str] = Field(None, max_length=1000, description="Nội dung đánh giá")


class ReviewCreate(ReviewBase):
    book_id: str
    # user_id sẽ được lấy từ current_user trong dependency


class ReviewUpdate(BaseModel):
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=1000)
    
    model_config = ConfigDict(from_attributes=True)


class ReviewResponse(ReviewBase):
    review_id: int
    book_id: str
    user_id: str
    user_fullname: Optional[str] = None
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class BookRatingSummary(BaseModel):
    average_rating: float = Field(..., description="Điểm trung bình")
    total_reviews: int = Field(..., description="Tổng số đánh giá")
    rating_distribution: dict = Field(..., description="Phân bố đánh giá theo sao")
    
    model_config = ConfigDict(from_attributes=True)