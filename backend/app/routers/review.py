from fastapi import APIRouter, Depends, status, Query
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.review import (
    ReviewCreate, 
    ReviewUpdate,
    ReviewResponse, 
    BookRatingSummary
)
from app.services import review as review_service

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/book/{book_id}", response_model=List[ReviewResponse])
def get_book_reviews(
    book_id: str,
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Lấy danh sách đánh giá của sách (Public)"""
    return review_service.get_book_reviews(db, book_id, skip, limit)


@router.get("/book/{book_id}/summary", response_model=BookRatingSummary)
def get_rating_summary(
    book_id: str, 
    db: Session = Depends(get_db)
):
    """Lấy thống kê đánh giá của sách (Public)"""
    return review_service.get_rating_summary(db, book_id)


@router.post("/", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def create_review(
    data: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Tạo đánh giá mới (Authenticated)"""
    return review_service.create_review(db, current_user.user_id, data)


@router.put("/{review_id}", response_model=ReviewResponse)
def update_review(
    review_id: int,
    data: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Cập nhật đánh giá của mình (Authenticated)"""
    return review_service.update_review(db, review_id, current_user.user_id, data)


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review(
    review_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Xóa đánh giá của mình (Authenticated)"""
    review_service.delete_review(db, review_id, current_user.user_id, is_admin=False)
    return None


@router.delete("/admin/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_review_admin(
    review_id: int,
    current_admin: User = Depends(require_admin),
    db: Session = Depends(get_db)
):
    """Admin xóa đánh giá bất kỳ"""
    review_service.delete_review(db, review_id, current_admin.user_id, is_admin=True)
    return None