from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func
import uuid

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.book import Book
from app.models.category import Category
from app.models.user import User
from app.schemas.book_admin import (
    BookCreateAdmin, 
    BookUpdateAdmin, 
    BookResponseAdmin,
    BookListResponseAdmin
)

router = APIRouter(prefix="/admin/books", tags=["Admin - Books"])


@router.get("/", response_model=BookListResponseAdmin)
async def get_all_books_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy danh sách tất cả sách (Admin) - có phân trang"""
    
    try:
        stmt = select(Book).options(joinedload(Book.category))
        count_stmt = select(func.count()).select_from(Book)
        total = db.execute(count_stmt).scalar()
        
        stmt = stmt.offset(skip).limit(limit).order_by(Book.created_at.desc())
        result = db.execute(stmt)
        books = result.scalars().all()
        
        books_data = []
        for book in books:
            books_data.append({
                "book_id": book.book_id,
                "title": book.title,
                "author": book.author,
                "publisher": book.publisher,
                "publication_year": book.publication_year,
                "category_id": book.category_id,
                "category_name": book.category.category_name if book.category else None,
                "price": book.price,
                "stock_quantity": book.stock_quantity,
                "sold_quantity": book.sold_quantity,
                "description": book.description,
                "cover_image_url": book.cover_image_url,
                "created_at": book.created_at,
                "updated_at": book.updated_at,
            })
        
        return {"total": total, "books": books_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy danh sách sách: {str(e)}"
        )


@router.get("/{book_id}", response_model=BookResponseAdmin)
async def get_book_detail_admin(
    book_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy chi tiết một cuốn sách (Admin)"""
    
    try:
        stmt = select(Book).options(joinedload(Book.category)).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()
        
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sách"
            )
        
        return {
            "book_id": book.book_id,
            "title": book.title,
            "author": book.author,
            "publisher": book.publisher,
            "publication_year": book.publication_year,
            "category_id": book.category_id,
            "category_name": book.category.category_name if book.category else None,
            "price": book.price,
            "stock_quantity": book.stock_quantity,
            "sold_quantity": book.sold_quantity,
            "description": book.description,
            "cover_image_url": book.cover_image_url,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy chi tiết sách: {str(e)}"
        )


@router.post("/", response_model=BookResponseAdmin, status_code=status.HTTP_201_CREATED)
async def create_book_admin(
    book_data: BookCreateAdmin,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Tạo sách mới (Admin)"""
    
    try:
        stmt = select(Category).where(Category.category_id == book_data.category_id)
        category = db.execute(stmt).scalar_one_or_none()
        if not category:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Thể loại không tồn tại"
            )
        
        new_book_id = f"B{str(uuid.uuid4().int)[:8]}"
        
        new_book = Book(
            book_id=new_book_id,
            title=book_data.title,
            author=book_data.author,
            publisher=book_data.publisher,
            publication_year=book_data.publication_year,
            category_id=book_data.category_id,
            price=book_data.price,
            stock_quantity=book_data.stock_quantity,
            sold_quantity=0,
            description=book_data.description,
            cover_image_url=book_data.cover_image_url
        )
        
        db.add(new_book)
        db.commit()
        db.refresh(new_book)
        
        stmt = select(Book).options(joinedload(Book.category)).where(Book.book_id == new_book_id)
        result = db.execute(stmt)
        book = result.scalar_one()
        
        return {
            "book_id": book.book_id,
            "title": book.title,
            "author": book.author,
            "publisher": book.publisher,
            "publication_year": book.publication_year,
            "category_id": book.category_id,
            "category_name": book.category.category_name if book.category else None,
            "price": book.price,
            "stock_quantity": book.stock_quantity,
            "sold_quantity": book.sold_quantity,
            "description": book.description,
            "cover_image_url": book.cover_image_url,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo sách: {str(e)}"
        )


@router.put("/{book_id}", response_model=BookResponseAdmin)
async def update_book_admin(
    book_id: str,
    book_data: BookUpdateAdmin,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Cập nhật thông tin sách (Admin)"""
    
    try:
        stmt = select(Book).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()
        
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sách"
            )
        
        if book_data.category_id:
            stmt = select(Category).where(Category.category_id == book_data.category_id)
            category = db.execute(stmt).scalar_one_or_none()
            if not category:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Thể loại không tồn tại"
                )
        
        update_data = book_data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(book, key, value)
        
        db.commit()
        db.refresh(book)
        
        stmt = select(Book).options(joinedload(Book.category)).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one()
        
        return {
            "book_id": book.book_id,
            "title": book.title,
            "author": book.author,
            "publisher": book.publisher,
            "publication_year": book.publication_year,
            "category_id": book.category_id,
            "category_name": book.category.category_name if book.category else None,
            "price": book.price,
            "stock_quantity": book.stock_quantity,
            "sold_quantity": book.sold_quantity,
            "description": book.description,
            "cover_image_url": book.cover_image_url,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật sách: {str(e)}"
        )


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book_admin(
    book_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Xóa sách (Admin)"""
    
    try:
        stmt = select(Book).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()
        
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sách"
            )
        
        if book.order_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa sách đã có trong đơn hàng"
            )
        
        db.delete(book)
        db.commit()
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xóa sách: {str(e)}"
        )


@router.patch("/{book_id}/stock", response_model=BookResponseAdmin)
async def update_stock_admin(
    book_id: str,
    stock_quantity: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Cập nhật số lượng tồn kho (Admin)"""
    
    try:
        stmt = select(Book).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()
        
        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy sách"
            )
        
        book.stock_quantity = stock_quantity
        db.commit()
        db.refresh(book)
        
        stmt = select(Book).options(joinedload(Book.category)).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one()
        
        return {
            "book_id": book.book_id,
            "title": book.title,
            "author": book.author,
            "publisher": book.publisher,
            "publication_year": book.publication_year,
            "category_id": book.category_id,
            "category_name": book.category.category_name if book.category else None,
            "price": book.price,
            "stock_quantity": book.stock_quantity,
            "sold_quantity": book.sold_quantity,
            "description": book.description,
            "cover_image_url": book.cover_image_url,
            "created_at": book.created_at,
            "updated_at": book.updated_at,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật tồn kho: {str(e)}"
        )