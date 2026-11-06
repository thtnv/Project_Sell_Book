# 📚 UTE BookStore - Hệ Thống Bán Sách Trực Tuyến & Quản Trị Toàn Diện

> **Dự án Website Thương Mại Điện Tử Bán Sách Full-Stack** được xây dựng với kiến trúc hiện đại, phân quyền người dùng và quản trị viên (Admin), tích hợp thanh toán trực tuyến Stripe và Trợ lý AI tư vấn sách thông minh.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![MySQL / TiDB](https://img.shields.io/badge/TiDB_Cloud-MySQL_8.0-4479A1?style=for-the-badge&logo=mysql)](https://tidbcloud.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel)](https://project-sell-book-ten.vercel.app/)
[![Render](https://img.shields.io/badge/Render-Live-46E3B7?style=for-the-badge&logo=render)](https://project-sell-book.onrender.com)

---

## 🌐 Trải Nghiệm Trực Tiếp (Live Demo & API Docs)

| Thành phần | Đường dẫn (Live URL) | Mô tả |
| :--- | :--- | :--- |
| **Giao diện người dùng (Frontend)** | 🚀 **[https://project-sell-book-ten.vercel.app/](https://project-sell-book-ten.vercel.app/)** | Triển khai trên **Vercel** (Next.js 16) |
| **Máy chủ API (Backend)** | ⚡ **[https://project-sell-book.onrender.com](https://project-sell-book.onrender.com)** | Triển khai trên **Render** (FastAPI) |
| **Tài liệu API tương tác (Swagger UI)** | 📖 **[https://project-sell-book.onrender.com/docs](https://project-sell-book.onrender.com/docs)** | Trực quan hóa 60+ API endpoints |
| **Cơ sở dữ liệu (Cloud Database)** | ☁️ **TiDB Cloud Serverless** | Cụm MySQL 8.0 bảo mật SSL/TLS (Singapore) |

---

## 🔑 Tài Khoản Trải Nghiệm (Demo Credentials)

Hệ thống hỗ trợ đăng nhập bằng Số điện thoại (chuẩn SMS/OTP) hoặc Email:

| Vai trò | Số điện thoại | Email | Mật khẩu | Quyền hạn |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `0111222333` | `admin@bookshop.com` | `123456` | Toàn quyền quản trị Dashboard, sách, danh mục, đơn hàng, khách hàng, doanh thu |
| **Khách hàng (Customer)** | `0123456789` | `john.doe@email.com` | `123456` | Tìm kiếm, xem sách, đánh giá, giỏ hàng, đặt hàng, chat AI |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### 1. Frontend
- **Framework:** Next.js 16 (App Router, Turbopack, Server & Client Components)
- **UI & Styling:** Tailwind CSS, Lucide React Icons
- **Hiệu ứng & Trực quan:** Framer Motion, Swiper.js, Chart.js / React-ChartJS-2
- **Form & Validation:** React Hook Form, Yup resolver
- **Xác thực:** Google OAuth 2.0, Facebook Login SDK, JWT Token lưu trữ client

### 2. Backend & Microservices
- **Framework:** FastAPI (Python 3.11)
- **ORM & Database Driver:** SQLAlchemy 2.0, PyMySQL (hỗ trợ SSL/TLS native)
- **Xác thực & Bảo mật:** JWT (Python-Jose), Bcrypt password hashing, CORS Middleware
- **Tích hợp bên thứ ba:**
  - **Stripe API:** Xử lý cổng thanh toán quốc tế thẻ tín dụng / Webhook
  - **Google Gemini AI API:** Chatbot tư vấn gợi ý sách ngữ cảnh tự nhiên
  - **SMTP Gmail:** Gửi email xác nhận đơn hàng tự động

### 3. Cơ sở dữ liệu & Triển khai
- **Database:** TiDB Cloud Serverless (MySQL 8.0 tương thích 100%)
- **CI/CD & Hosting:** Vercel (Frontend), Render (Backend)
- **Containerization:** Docker, Dockerfile multi-stage, Docker Compose

---

## ✨ Tính Năng Nổi Bật

- [x] **Tìm kiếm & Bộ lọc nâng cao:** Tìm kiếm theo tên sách, tác giả, lọc theo danh mục, mức giá và trạng thái còn hàng.
- [x] **Giỏ hàng & Đặt hàng:** Tính toán tổng tiền theo thời gian thực, áp dụng mã giảm giá (voucher), lưu giỏ hàng linh hoạt.
- [x] **Cổng thanh toán Stripe:** Hỗ trợ thanh toán bảo mật với quy trình kiểm tra trạng thái đơn hàng và trang thành công/thất bại có Suspense fallback.
- [x] **Trợ lý AI tư vấn sách:** Chat widget tích hợp Gemini AI hiểu ngữ cảnh nội dung sách và sở thích độc giả.
- [x] **Đánh giá & Bình luận:** Độc giả gửi nhận xét, xếp hạng sao (1 - 5 sao) cho từng cuốn sách.
- [x] **Hệ thống Quản trị (Admin Dashboard):**
  - Biểu đồ thống kê doanh thu theo tháng, trạng thái đơn hàng (Chart.js).
  - Quản lý kho sách (thêm mới với Form upload ảnh, sửa giá, cập nhật tồn kho).
  - Quản lý danh mục thể loại và tài khoản người dùng.
  - Xử lý phản hồi liên hệ khách hàng và cập nhật tiến trình đơn hàng.

---

## 🌿 Quy Trình Phân Chia Nhánh (Git Workflow 3 Nhánh)

Dự án áp dụng mô hình Git branching tiêu chuẩn công nghiệp:
- `main`: Nhánh ổn định cao nhất, dùng triển khai Cloud và nộp sản phẩm. Tuyệt đối không commit trực tiếp.
- `dev`: Nhánh tích hợp chính. Nhận các tính năng sau khi kiểm thử và tiến hành test hồi quy.
- `feature/*`: Nhánh phát triển tính năng riêng biệt (ví dụ: `feature/login`, `feature/payment-stripe`), sau khi hoàn thành sẽ merge vào `dev`.

---

## 💻 Hướng Dẫn Cài Đặt Cục Bộ (Local Development)

### Cách 1: Sử dụng Docker Compose (Khuyên dùng - 1 lệnh duy nhất)

```bash
# Clone dự án
git clone https://github.com/thtnv/Project_Sell_Book.git
cd Project_Sell_Book

# Khởi chạy toàn bộ hệ thống (MySQL + Backend + Frontend)
docker compose up --build
```
- Frontend: `http://localhost:3000`
- Backend API Docs: `http://localhost:8000/docs`

---

### Cách 2: Chạy Thủ Công

#### 1. Cấu hình Backend (FastAPI)
```bash
cd backend

# Tạo và kích hoạt môi trường ảo
python -m venv venv
# Windows:
.\venv\Scripts\Activate.ps1
# macOS/Linux:
source venv/bin/activate

# Cài đặt dependencies
pip install -r requirements.txt

# Tạo file .env dựa trên .env.example
cp .env.example .env

# Khởi chạy server
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

#### 2. Cấu hình Frontend (Next.js)
```bash
cd frontend

# Cài đặt thư viện
npm install

# Tạo file .env.local dựa trên .env.example
# Khởi chạy ứng dụng
npm run dev
```

---

## 🗄️ Cấu Trúc Database (Schema)

Toàn bộ script khởi tạo 12 bảng và 20 cuốn sách mẫu cùng dữ liệu được lưu tại [`database/init_database.sql`](./database/init_database.sql):
- `categories`: Danh mục sách
- `users`: Thông tin người dùng & phân quyền (`admin`, `customer`)
- `books`: Thông tin sách, giá, tồn kho, ảnh bìa
- `payment_methods`: Phương thức thanh toán (COD, Stripe, Momo, v.v.)
- `order_status`: Trạng thái đơn (Chờ xử lý, Đang giao, Đã giao, Hủy)
- `orders` & `order_details`: Đơn hàng và chi tiết sản phẩm
- `reviews`: Đánh giá xếp hạng sao và bình luận
- `favorites`: Danh sách sách yêu thích
- `discounts` & `discount_applications`: Mã giảm giá khuyến mãi
- `contacts`: Hộp thư liên hệ và phản hồi từ quản trị viên
