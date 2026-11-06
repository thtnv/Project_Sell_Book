from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings
from app.models.base import Base

# Đảm bảo các model đã được import để Base nhận diện
from app.models import (
    User,
    Book,
    Category,
    Order,
    OrderDetail,
    PaymentMethod,
    Review,
    Discount,
    DiscountApplication,
    Contact,
    OrderStatus,
)

# Tạo Engine kết nối hỗ trợ cả MySQL và SQLite
connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def init_db():
    # Lệnh này sẽ tự động tạo các bảng trong MySQL nếu chưa có
    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
