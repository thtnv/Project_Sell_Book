from sqlalchemy.orm import Session
from sqlalchemy import func, select
from fastapi import HTTPException, status
from datetime import datetime

from app.models.review import Review
from app.models.user import User
from app.models.order import Order
from app.models.order_detail import OrderDetail
from app.models.book import Book
from app.schemas.review import ReviewCreate, ReviewUpdate


def check_user_purchased_book(db: Session, user_id: str, book_id: str) -> bool:
    """Kiểm tra user đã mua sách chưa"""
    stmt = (
        select(Order)
        .join(OrderDetail, Order.order_id == OrderDetail.order_id)
        .join(Book, OrderDetail.book_id == Book.book_id)
        .where(
            Order.user_id == user_id,
            Book.book_id == book_id,
            Order.status_id.in_(
                select(func.distinct(func.substring(Order.status_id, 1, 10)))
                .where(Order.status_id != 'ST005')  # Không tính đơn đã hủy
            )
        )
    )
    result = db.execute(stmt).first()
    return result is not None


def get_book_reviews(db: Session, book_id: str, skip: int = 0, limit: int = 50):
    """Lấy danh sách đánh giá của một cuốn sách"""
    stmt = (
        select(Review, User.full_name)
        .join(User, Review.user_id == User.user_id)
        .where(Review.book_id == book_id)
        .order_by(Review.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    
    reviews = db.execute(stmt).all()
    
    result = []
    for review, user_name in reviews:
        review_dict = {
            "review_id": review.review_id,
            "book_id": review.book_id,
            "user_id": review.user_id,
            "user_fullname": user_name,
            "rating": review.rating,
            "comment": review.comment,
            "created_at": review.created_at
        }
        result.append(review_dict)
    
    return result


def get_rating_summary(db: Session, book_id: str):
    """Lấy thống kê đánh giá của sách"""
    # Điểm trung bình và tổng số đánh giá
    stats = db.execute(
        select(
            func.avg(Review.rating).label("avg"),
            func.count(Review.review_id).label("count")
        ).where(Review.book_id == book_id)
    ).first()
    
    # Phân bố đánh giá theo sao (1-5 sao)
    distribution = {}
    for star in range(1, 6):
        count = db.execute(
            select(func.count(Review.review_id))
            .where(Review.book_id == book_id, Review.rating == star)
        ).scalar()
        distribution[f"{star}_star"] = count
    
    return {
        "average_rating": round(float(stats.avg or 0), 1),
        "total_reviews": stats.count or 0,
        "rating_distribution": distribution
    }


def create_review(db: Session, user_id: str, data: ReviewCreate):
    """Tạo đánh giá mới"""
    # 1. Kiểm tra sách có tồn tại không
    book = db.execute(select(Book).where(Book.book_id == data.book_id)).scalar_one_or_none()
    if not book:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy sách"
        )
    
    # 2. Kiểm tra đã mua sách chưa
    if not check_user_purchased_book(db, user_id, data.book_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn cần mua sách này trước khi đánh giá"
        )
    
    # 3. Kiểm tra đã đánh giá chưa
    existing = db.execute(
        select(Review).where(
            Review.book_id == data.book_id,
            Review.user_id == user_id
        )
    ).scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Bạn đã đánh giá sách này rồi"
        )
    
    # 4. Tạo review mới
    new_review = Review(
        book_id=data.book_id,
        user_id=user_id,
        rating=data.rating,
        comment=data.comment,
        created_at=datetime.utcnow()
    )
    
    db.add(new_review)
    db.commit()
    db.refresh(new_review)
    
    # 5. Lấy tên user để trả về
    user = db.execute(select(User).where(User.user_id == user_id)).scalar_one()
    
    return {
        "review_id": new_review.review_id,
        "book_id": new_review.book_id,
        "user_id": new_review.user_id,
        "user_fullname": user.full_name,
        "rating": new_review.rating,
        "comment": new_review.comment,
        "created_at": new_review.created_at
    }


def update_review(db: Session, review_id: int, user_id: str, data: ReviewUpdate):
    """Cập nhật đánh giá (chỉ user tạo mới được sửa)"""
    review = db.execute(
        select(Review).where(Review.review_id == review_id)
    ).scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    if review.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền sửa đánh giá này"
        )
    
    # Update fields
    if data.rating is not None:
        review.rating = data.rating
    if data.comment is not None:
        review.comment = data.comment
    
    db.commit()
    db.refresh(review)
    
    # Get user name
    user = db.execute(select(User).where(User.user_id == user_id)).scalar_one()
    
    return {
        "review_id": review.review_id,
        "book_id": review.book_id,
        "user_id": review.user_id,
        "user_fullname": user.full_name,
        "rating": review.rating,
        "comment": review.comment,
        "created_at": review.created_at
    }


def delete_review(db: Session, review_id: int, user_id: str, is_admin: bool = False):
    """Xóa đánh giá (user hoặc admin)"""
    review = db.execute(
        select(Review).where(Review.review_id == review_id)
    ).scalar_one_or_none()
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy đánh giá"
        )
    
    # Chỉ cho phép user tạo hoặc admin xóa
    if not is_admin and review.user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Bạn không có quyền xóa đánh giá này"
        )
    
    db.delete(review)
    db.commit()
    return True