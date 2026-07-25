# Book Sales Management System

Hệ thống quản lý bán sách trực tuyến với đầy đủ chức năng cho Khách hàng (Customer) và Quản trị viên (Admin). 

## Tech Stack
- **Frontend:** Next.js, Tailwind CSS
- **Backend:** Python (FastAPI)
- **Database:** MySQL

## Hướng dẫn cài đặt

### 1. Cài đặt Database (MySQL)
1. Mở MySQL/phpMyAdmin, tạo một database mới:
   ```sql
   CREATE DATABASE book_management;
### 2. Cấu hình Backend (FastAPI)
# Bước 1: Tạo môi trường ảo (Virtual Environment) ( nếu đã có venv thì chuyển sang bước 2 )
python -m venv venv 

# Bước 2: Kích hoạt môi trường ảo
# Trên Windows:
.\venv\Scripts\Activate.ps1
# Trên macOS/Linux:
source venv/bin/activate

# Bước 3: Cài đặt thư viện
pip install -r requirements.txt

# Bước 4: Tạo file .env và cấu hình Database URL (Dựa theo file .env.example)

# Bước 5: Khởi chạy server
uvicorn app.main:app --reload

## Mỗi lần cài đặt thư viện mới ( pip install ... ) thì thêm bước chạy lệnh pip freeze > requirements.txt để cập nhập thư viện trong file requirement.txt

### 3. Cấu hình Frontend (Next.js)
# Cài đặt các dependencies
npm install

# Khởi chạy giao diện
npm run dev

###  Database
-- 1. Users Table (Auth & Authorization)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    fullname VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer', -- 'admin' or 'customer'
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Categories Table
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    categoryname VARCHAR(50) NOT NULL UNIQUE
);

-- 3. Books Table (Admin CRUD)
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publisher VARCHAR(100),
    publishyear INT,
    categoryid INT,
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock INT DEFAULT 0 CHECK (stock >= 0),
    description TEXT,
    imageurl VARCHAR(255),
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (categoryid) REFERENCES categories(id) ON DELETE SET NULL
);

-- 4. Cart Table
CREATE TABLE cart (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT,
    bookid INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bookid) REFERENCES books(id) ON DELETE CASCADE
);

-- 5. Orders Table
CREATE TABLE orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT,
    totalprice DECIMAL(10,2) NOT NULL CHECK (totalprice >= 0),
    orderstatus VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, shipping, delivered, cancelled
    paymentstatus VARCHAR(20) DEFAULT 'unpaid', -- unpaid, paid
    shippingaddress VARCHAR(255) NOT NULL,
    createdat DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. OrderDetails Table
CREATE TABLE orderdetails (
    id INT PRIMARY KEY AUTO_INCREMENT,
    orderid INT,
    bookid INT,
    quantity INT NOT NULL CHECK (quantity > 0),
    priceatpurchase DECIMAL(10,2) NOT NULL, 
    FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (bookid) REFERENCES books(id) ON DELETE CASCADE
);
