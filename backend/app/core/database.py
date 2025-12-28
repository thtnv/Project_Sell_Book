from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from .config import settings
from app.models.base import Base
# Đảm bảo các model đã được import để Base nhận diện
from app.models import User, Book, Category,Order, OrderDetail, PaymentMethod, Review, DiscountCode, DiscountApplication, Contact

# Tạo Engine kết nối cho MySQL
engine = create_engine(settings.DATABASE_URL)

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