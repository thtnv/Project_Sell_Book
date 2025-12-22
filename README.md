# Phần backend
 - bước 1 : python -m venv venv ( nếu đã có venv thì chuyển sang bước 2 )
 - bước 2 :  .\venv\Scripts\Activate.ps1
 - bước 3 : pip install -r requirements.txt
 - bước 4 :  uvicorn app.main:app --reload

## Mỗi lần cài đặt thư viện mới ( pip install ... ) thì thêm bước chạy lệnh pip freeze > requirements.txt để cập nhập thư viện trong file requirement.txt

# Phần frontend
 - chạy npm run dev


##  Database
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
