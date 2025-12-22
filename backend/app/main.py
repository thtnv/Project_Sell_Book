from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.core.database import get_db, init_db

app = FastAPI(title="My Advanced Project")

# Khởi tạo bảng khi server bắt đầu (Nếu dùng MySQL, đảm bảo db 'book_shop' đã tồn tại)
@app.on_event("startup")
def on_startup():
    init_db()

@app.get("/")
def root():
    return {"message": "Server is running!"}

# Endpoint kiểm tra kết nối Database
@app.get("/test-db")
def test_db_connection(db: Session = Depends(get_db)):
    try:
        # Thực hiện một truy vấn đơn giản nhất để kiểm tra phản hồi từ MySQL
        db.execute(text("SELECT 1"))
        return {
            "status": "success",
            "database": "connected",
            "message": "Kết nối với MySQL (XAMPP) thành công!"
        }
    except Exception as e:
        # Nếu có lỗi (sai thông tin, chưa bật XAMPP, thiếu thư viện...), trả về lỗi 500
        raise HTTPException(
            status_code=500, 
            detail=f"Kết nối database thất bại: {str(e)}"
        )