from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func
from typing import List

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.category import Category
from app.models.book import Book
from app.models.user import User
from app.schemas.category import (
    CategoryCreate,
    CategoryUpdate,
    CategoryResponse,
    CategoryListResponse,
    CategoryDetailResponse
)

router = APIRouter(prefix="/admin/categories", tags=["Admin - Categories"])


@router.get("/", response_model=CategoryListResponse)
async def get_all_categories_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy danh sách tất cả thể loại (Admin) - có phân trang"""
    
    try:
        # Đếm tổng số thể loại
        count_stmt = select(func.count()).select_from(Category)
        total = db.execute(count_stmt).scalar()
        
        # Lấy danh sách thể loại
        stmt = select(Category).offset(skip).limit(limit).order_by(Category.category_id)
        result = db.execute(stmt)
        categories = result.scalars().all()
        
        # Tạo response với thông tin chi tiết
        categories_data = []
        for category in categories:
            # Đếm số sách khác nhau trong thể loại
            book_count_stmt = select(func.count(func.distinct(Book.book_id))).where(
                Book.category_id == category.category_id
            )
            book_count = db.execute(book_count_stmt).scalar() or 0
            
            # Tính tổng số lượng sách trong kho
            stock_sum_stmt = select(func.sum(Book.stock_quantity)).where(
                Book.category_id == category.category_id
            )
            total_stock = db.execute(stock_sum_stmt).scalar() or 0
            
            categories_data.append({
                "category_id": category.category_id,
                "category_name": category.category_name,
                "book_count": book_count,
                "total_stock": total_stock
            })
        
        return {"total": total, "categories": categories_data}
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy danh sách thể loại: {str(e)}"
        )


@router.get("/{category_id}", response_model=CategoryDetailResponse)
async def get_category_detail_admin(
    category_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy chi tiết một thể loại (Admin)"""
    
    try:
        stmt = select(Category).where(Category.category_id == category_id)
        result = db.execute(stmt)
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thể loại"
            )
        
        # Đếm số sách
        book_count_stmt = select(func.count(func.distinct(Book.book_id))).where(
            Book.category_id == category.category_id
        )
        book_count = db.execute(book_count_stmt).scalar() or 0
        
        # Tổng tồn kho
        stock_sum_stmt = select(func.sum(Book.stock_quantity)).where(
            Book.category_id == category.category_id
        )
        total_stock = db.execute(stock_sum_stmt).scalar() or 0
        
        return {
            "category_id": category.category_id,
            "category_name": category.category_name,
            "book_count": book_count,
            "total_stock": total_stock
        }
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy chi tiết thể loại: {str(e)}"
        )


@router.post("/", response_model=CategoryResponse, status_code=status.HTTP_201_CREATED)
async def create_category_admin(
    category_data: CategoryCreate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Tạo thể loại mới (Admin)"""
    
    try:
        # Kiểm tra ID đã tồn tại
        existing_id = db.execute(
            select(Category).where(Category.category_id == category_data.category_id)
        ).scalar_one_or_none()
        
        if existing_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Mã thể loại đã tồn tại"
            )
        
        # Kiểm tra tên đã tồn tại
        existing_name = db.execute(
            select(Category).where(Category.category_name == category_data.category_name)
        ).scalar_one_or_none()
        
        if existing_name:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Tên thể loại đã tồn tại"
            )
        
        # Tạo thể loại mới
        new_category = Category(
            category_id=category_data.category_id,
            category_name=category_data.category_name
        )
        
        db.add(new_category)
        db.commit()
        db.refresh(new_category)
        
        return new_category
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo thể loại: {str(e)}"
        )


@router.put("/{category_id}", response_model=CategoryResponse)
async def update_category_admin(
    category_id: str,
    category_data: CategoryUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Cập nhật thông tin thể loại (Admin)"""
    
    try:
        stmt = select(Category).where(Category.category_id == category_id)
        result = db.execute(stmt)
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thể loại"
            )
        
        # Kiểm tra tên mới có trùng không
        if category_data.category_name:
            existing = db.execute(
                select(Category).where(
                    Category.category_name == category_data.category_name,
                    Category.category_id != category_id
                )
            ).scalar_one_or_none()
            
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Tên thể loại đã tồn tại"
                )
            
            category.category_name = category_data.category_name
        
        db.commit()
        db.refresh(category)
        
        return category
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật thể loại: {str(e)}"
        )


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category_admin(
    category_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Xóa thể loại (Admin)"""
    
    try:
        stmt = select(Category).where(Category.category_id == category_id)
        result = db.execute(stmt)
        category = result.scalar_one_or_none()
        
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy thể loại"
            )
        
        # Kiểm tra xem có sách nào trong thể loại này không
        book_count = db.execute(
            select(func.count()).select_from(Book).where(Book.category_id == category_id)
        ).scalar()
        
        if book_count > 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Không thể xóa thể loại vì có {book_count} sách trong thể loại này"
            )
        
        db.delete(category)
        db.commit()
        return None
    
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xóa thể loại: {str(e)}"
        )