from fastapi import APIRouter, Depends, HTTPException,Query
from sqlalchemy.orm import Session, joinedload
from app.core.database import get_db
from app.models.book import Book
from app.schemas.book import BookList, BookDetail

router = APIRouter(prefix="/books", tags=["Books"])


@router.get("/")
def get_books(
    filter: str = Query("Tất cả", enum=["Tất cả", "Sách hot", "Xu hướng"]),
    db: Session = Depends(get_db)
):
    query = db.query(Book)

    if filter == "Sách hot":
        query = query.filter(Book.sold_quantity >= 150)
    elif filter == "Xu hướng":
        query = query.order_by(Book.created_at.desc())
    
    return query.all()


@router.get("/{book_id}", response_model=BookDetail)
def get_book_detail(book_id: str, db: Session = Depends(get_db)):
    """Lấy chi tiết một cuốn sách"""
    book = db.query(Book).options(
        joinedload(Book.category)
    ).filter(Book.book_id == book_id).first()
    
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
        category_name=book.category.category_name if book.category else None
    )