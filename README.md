# Phần backend
 - bước 1 : python -m venv venv ( nếu đã có venv thì chuyển sang bước 2 )
 - bước 2 :  .\venv\Scripts\Activate.ps1
 - bước 3 : pip install -r requirements.txt
 - bước 4 :  uvicorn app.main:app --reload

## Mỗi lần cài đặt thư viện mới ( pip install ... ) thì thêm bước chạy lệnh pip freeze > requirements.txt để cập nhập thư viện trong file requirement.txt

# Phần frontend
 - chạy npm run dev


##  Database
DROP DATABASE IF EXISTS book_shop;
CREATE DATABASE book_shop;
USE book_shop;

-- ============================================
-- CREATE TABLES
-- ============================================

-- 1. Categories
CREATE TABLE categories (
    category_id VARCHAR(10) PRIMARY KEY,
    category_name VARCHAR(50) UNIQUE NOT NULL
);

-- 2. Users
CREATE TABLE users (
    user_id VARCHAR(10) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(128) NOT NULL,
    phone VARCHAR(15),
    address VARCHAR(255),
    role VARCHAR(20) DEFAULT 'customer',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 3. Books
CREATE TABLE books (
    book_id VARCHAR(10) PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publisher VARCHAR(100),
    publication_year INT,
    category_id VARCHAR(10),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    sold_quantity INT DEFAULT 0 CHECK (sold_quantity >= 0),
    description TEXT,
    cover_image_url VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP, 
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- 4. Payment Methods
CREATE TABLE payment_methods (
    payment_method_id VARCHAR(10) PRIMARY KEY,
    method_name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 5. Order Status
CREATE TABLE order_status (
    status_id VARCHAR(10) PRIMARY KEY,
    status_name VARCHAR(50) UNIQUE NOT NULL
);

-- 6. Orders
CREATE TABLE orders (
    order_id VARCHAR(10) PRIMARY KEY,
    user_id VARCHAR(10),
    total_amount DECIMAL(10,2) NOT NULL CHECK (total_amount >= 0),
    -- Thay order_status(String) bằng status_id(FK)
    status_id VARCHAR(10), 
    shipping_address VARCHAR(255),
    payment_method_id VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(payment_method_id) ON DELETE SET NULL,
    FOREIGN KEY (status_id) REFERENCES order_status(status_id) ON DELETE SET NULL
);

-- 7. Order Details
CREATE TABLE order_details (
    detail_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(10),
    book_id VARCHAR(10),
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(10,2) NOT NULL CHECK (unit_price >= 0),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- 8. Reviews
CREATE TABLE reviews (
    review_id INT PRIMARY KEY AUTO_INCREMENT,
    book_id VARCHAR(10),
    user_id VARCHAR(10),
    rating INT CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (book_id, user_id),
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 9. Favorites
CREATE TABLE favorites (
    favorite_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10),
    book_id VARCHAR(10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, book_id),
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (book_id) REFERENCES books(book_id) ON DELETE CASCADE
);

-- 10. Discounts
CREATE TABLE discounts (
    discount_id VARCHAR(10) PRIMARY KEY,
    voucher_code VARCHAR(20) UNIQUE NOT NULL,
    discount_percentage DECIMAL(5,2) CHECK (discount_percentage BETWEEN 1 AND 100),
    expiry_date DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 11. Discount Applications
CREATE TABLE discount_applications (
    application_id INT PRIMARY KEY AUTO_INCREMENT,
    order_id VARCHAR(10),
    discount_id VARCHAR(10),
    UNIQUE (order_id, discount_id),
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (discount_id) REFERENCES discounts(discount_id)
);

-- 12. Contacts
CREATE TABLE contacts (
    contact_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id VARCHAR(10) NULL,
    full_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    admin_response TEXT NULL,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE SET NULL
);