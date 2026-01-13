import os
from dotenv import load_dotenv
from pathlib import Path

# Tự động tìm file .env ở thư mục gốc của backend
env_path = Path(__file__).resolve().parent.parent.parent / ".env"
load_dotenv(dotenv_path=env_path)

class Settings:
    # Lấy DATABASE_URL từ .env, nếu không có sẽ dùng mặc định
    DATABASE_URL = os.getenv("DATABASE_URL", "mysql+pymysql://root@localhost/book_shop")
    
    # Cấu hình bảo mật
    SECRET_KEY = os.getenv("SECRET_KEY", "your-super-secret-key")
    ALGORITHM = os.getenv("ALGORITHM", "HS256")
    
    # Chuyển đổi sang kiểu int thủ công
    ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 1440))

    # Cấu hình email
    MAIL_USERNAME = os.getenv("MAIL_USERNAME")
    MAIL_PASSWORD = os.getenv("MAIL_PASSWORD")
    MAIL_FROM = os.getenv("MAIL_FROM")
    MAIL_PORT = int(os.getenv("MAIL_PORT", 587))
    MAIL_SERVER = os.getenv("MAIL_SERVER", "smtp.gmail.com")

# Khởi tạo object để các file khác sử dụng
settings = Settings()