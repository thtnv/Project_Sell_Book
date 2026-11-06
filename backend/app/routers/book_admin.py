from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status,
    Query,
    File,
    UploadFile,
    Form,
)
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, or_
from typing import Optional
from pathlib import Path
import uuid
import os
import shutil

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.book import Book
from app.models.category import Category
from app.models.user import User
from app.schemas.book_admin import (
    BookCreateAdmin,
    BookUpdateAdmin,
    BookResponseAdmin,
    BookListResponseAdmin,
)

router = APIRouter(prefix="/admin/books", tags=["Admin - Books"])

# --- CẤU HÌNH ĐƯỜNG DẪN LƯU ẢNH ---
# Đi lùi ra khỏi thư mục backend/app/routers (3 cấp) để về root, sau đó vào frontend
# Cấu trúc: Project_Sell_Book -> frontend -> public -> books
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent
UPLOAD_DIR = BASE_DIR / "frontend" / "public" / "books"

# Đảm bảo thư mục tồn tại
os.makedirs(UPLOAD_DIR, exist_ok=True)


def save_upload_file(upload_file: UploadFile) -> str:
    try:
        # Lấy đuôi file (jpg, png...)
        file_extension = os.path.splitext(upload_file.filename)[1]
        # Tạo tên file ngẫu nhiên để tránh trùng
        new_filename = f"{uuid.uuid4()}{file_extension}"

        # Đường dẫn lưu file
        file_path = UPLOAD_DIR / new_filename

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(upload_file.file, buffer)

        print(f"✅ Đã lưu ảnh tại: {file_path}")  # Log để debug
        return new_filename
    except Exception as e:
        print(f"❌ Lỗi lưu file: {e}")
        raise HTTPException(status_code=500, detail=f"Lỗi lưu file: {str(e)}")


@router.get("/", response_model=BookListResponseAdmin)
async def get_all_books_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(
        None, description="Tìm kiếm theo tên sách hoặc tác giả"
    ),  # <--- [THÊM]
    category_id: Optional[str] = Query(
        None, description="Lọc theo ID thể loại"
    ),  # <--- [THÊM]
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Lấy danh sách tất cả sách (Admin) - có phân trang và tìm kiếm"""

    try:
        # 1. Khởi tạo query cơ bản
        stmt = select(Book).options(joinedload(Book.category))

        # 2. Query dùng để đếm tổng số bản ghi (phục vụ phân trang)
        count_stmt = select(func.count()).select_from(Book)

        # 3. Áp dụng bộ lọc Tìm kiếm (Search)
        if search:
            search_term = f"%{search}%"
            # Tìm trong Title HOẶC Author
            search_condition = or_(
                Book.title.ilike(search_term), Book.author.ilike(search_term)
            )
            stmt = stmt.where(search_condition)
            count_stmt = count_stmt.where(search_condition)

        # 4. Áp dụng bộ lọc Thể loại (Category)
        if category_id:
            stmt = stmt.where(Book.category_id == category_id)
            count_stmt = count_stmt.where(Book.category_id == category_id)

        # 5. Thực thi đếm tổng số lượng (sau khi đã lọc)
        total = db.execute(count_stmt).scalar()

        # 6. Áp dụng phân trang và sắp xếp
        stmt = stmt.offset(skip).limit(limit).order_by(Book.created_at.desc())
        result = db.execute(stmt)
        books = result.scalars().all()

        # 7. Map dữ liệu trả về (Giữ nguyên code cũ của bạn)
        books_data = []
        for book in books:
            books_data.append(
                {
                    "book_id": book.book_id,
                    "title": book.title,
                    "author": book.author,
                    "publisher": book.publisher,
                    "publication_year": book.publication_year,
                    "category_id": book.category_id,
                    "category_name": (
                        book.category.category_name if book.category else None
                    ),
                    "price": book.price,
                    "stock_quantity": book.stock_quantity,
                    "sold_quantity": book.sold_quantity,
                    "description": book.description,
                    "cover_image_url": book.cover_image_url,
                    "created_at": book.created_at,
                    "updated_at": book.updated_at,
                }
            )

        return {"total": total, "books": books_data}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy danh sách sách: {str(e)}",
        )


@router.get("/{book_id}", response_model=BookResponseAdmin)
async def get_book_detail_admin(
    book_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Lấy chi tiết một cuốn sách (Admin)"""

    try:
        stmt = (
            select(Book)
            .options(joinedload(Book.category))
            .where(Book.book_id == book_id)
        )
        result = db.execute(stmt)
        book = result.scalar_one_or_none()

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy sách"
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
            detail=f"Lỗi lấy chi tiết sách: {str(e)}",
        )


@router.post("/", response_model=BookResponseAdmin, status_code=status.HTTP_201_CREATED)
async def create_book_admin(
    title: str = Form(...),
    author: str = Form(...),
    price: float = Form(...),
    category_id: str = Form(...),
    publisher: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    stock_quantity: int = Form(0),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),  # Nhận file ảnh
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Tạo sách mới với Upload ảnh"""
    try:
        # Validate Category
        stmt = select(Category).where(Category.category_id == category_id)
        category = db.execute(stmt).scalar_one_or_none()
        if not category:
            raise HTTPException(status_code=400, detail="Thể loại không tồn tại")

        # Xử lý upload ảnh
        image_filename = None
        if file:
            image_filename = save_upload_file(file)

        new_book_id = f"B{str(uuid.uuid4().int)[:8]}"

        new_book = Book(
            book_id=new_book_id,
            title=title,
            author=author,
            publisher=publisher,
            publication_year=publication_year,
            category_id=category_id,
            price=price,
            stock_quantity=stock_quantity,
            sold_quantity=0,
            description=description,
            cover_image_url=image_filename,  # Lưu tên file vào DB
        )

        db.add(new_book)
        db.commit()
        db.refresh(new_book)

        # Reload để lấy thông tin category
        stmt = (
            select(Book)
            .options(joinedload(Book.category))
            .where(Book.book_id == new_book_id)
        )
        book = db.execute(stmt).scalar_one()

        # Map sang schema response thủ công (hoặc dùng ORM mode)
        return book.to_dict()

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi tạo sách: {str(e)}")


@router.put("/{book_id}", response_model=BookResponseAdmin)
async def update_book_admin(
    book_id: str,
    title: Optional[str] = Form(None),
    author: Optional[str] = Form(None),
    price: Optional[float] = Form(None),
    category_id: Optional[str] = Form(None),
    publisher: Optional[str] = Form(None),
    publication_year: Optional[int] = Form(None),
    stock_quantity: Optional[int] = Form(None),
    description: Optional[str] = Form(None),
    file: Optional[UploadFile] = File(None),  # Ảnh mới (nếu có)
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Cập nhật sách và ảnh"""
    try:
        stmt = select(Book).where(Book.book_id == book_id)
        book = db.execute(stmt).scalar_one_or_none()

        if not book:
            raise HTTPException(status_code=404, detail="Không tìm thấy sách")

        # Cập nhật các trường text
        if title:
            book.title = title
        if author:
            book.author = author
        if price is not None:
            book.price = price
        if category_id:
            # Check category exist...
            book.category_id = category_id
        if publisher:
            book.publisher = publisher
        if publication_year:
            book.publication_year = publication_year
        if stock_quantity is not None:
            book.stock_quantity = stock_quantity
        if description:
            book.description = description

        # Xử lý upload ảnh mới
        if file:
            # (Optional: Xóa ảnh cũ nếu cần)
            new_filename = save_upload_file(file)
            book.cover_image_url = new_filename

        db.commit()
        db.refresh(book)

        # Reload để return full data
        stmt = (
            select(Book)
            .options(joinedload(Book.category))
            .where(Book.book_id == book_id)
        )
        return db.execute(stmt).scalar_one().to_dict()

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Lỗi cập nhật sách: {str(e)}")


@router.delete("/{book_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_book_admin(
    book_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Xóa sách (Admin)"""

    try:
        stmt = select(Book).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy sách"
            )

        if book.order_details:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa sách đã có trong đơn hàng",
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
            detail=f"Lỗi xóa sách: {str(e)}",
        )


@router.patch("/{book_id}/stock", response_model=BookResponseAdmin)
async def update_stock_admin(
    book_id: str,
    stock_quantity: int = Query(..., ge=0),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Cập nhật số lượng tồn kho (Admin)"""

    try:
        stmt = select(Book).where(Book.book_id == book_id)
        result = db.execute(stmt)
        book = result.scalar_one_or_none()

        if not book:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy sách"
            )

        book.stock_quantity = stock_quantity
        db.commit()
        db.refresh(book)

        stmt = (
            select(Book)
            .options(joinedload(Book.category))
            .where(Book.book_id == book_id)
        )
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
            detail=f"Lỗi cập nhật tồn kho: {str(e)}",
        )
