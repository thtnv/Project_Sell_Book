from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.book import Book
from app.schemas.book import BookList, BookDetail
from sqlalchemy import or_
from typing import Optional

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/")
def get_books(
    filter: str = Query("Tất cả", enum=["Tất cả", "Sách hot", "Xu hướng"]),
    search: Optional[str] = Query(
        None, description="Từ khóa tìm kiếm"
    ),  # <--- Thêm tham số search
    db: Session = Depends(get_db),
):
    query = db.query(Book)

    # 1. Xử lý tìm kiếm (Nếu có từ khóa)
    if search:
        search_term = f"%{search}%"
        # Tìm trong Tên sách HOẶC Tác giả
        query = query.filter(
            or_(Book.title.like(search_term), Book.author.like(search_term))
        )

    # 2. Xử lý bộ lọc
    if filter == "Sách hot":
        query = query.filter(Book.sold_quantity >= 150)
    elif filter == "Xu hướng":
        query = query.order_by(Book.created_at.desc())

    return query.all()


@router.get("/{book_id}", response_model=BookDetail)
def get_book_detail(book_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết một cuốn sách"""
    book = (
        db.query(Book)
        .options(joinedload(Book.category))
        .filter(Book.book_id == book_id)
        .first()
    )

    if not book:
        raise HTTPException(status_code=404, detail="Không tìm thấy sách")

    # Tạo response với thông tin category
    return BookDetail(
        book_id=book.book_id,
        title=book.title,
        author=book.author,
        publisher=book.publisher,
        publication_year=book.publication_year,
        price=book.price,
        stock_quantity=book.stock_quantity,
        sold_quantity=book.sold_quantity,
        description=book.description,
        cover_image_url=book.cover_image_url,
        category_name=book.category.category_name if book.category else None,
    )
