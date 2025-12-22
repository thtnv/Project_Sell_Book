# backend

Cấu trúc dự án FastAPI nâng cao (mẫu trống - chỉ có __init__.py).

## Cấu Trúc
backend/
├── app/
│   ├── __init__.py
│   ├── core/
│   │   └── __init__.py
│   ├── models/
│   │   └── __init__.py
│   ├── schemas/
│   │   └── __init__.py
│   ├── services/
│   │   └── __init__.py
│   └── routers/
│       └── __init__.py
├── requirements.txt
├── .env
└── README.md

## Hướng Dẫn Thêm Code
1. Thêm `main.py`, `database.py` vào `app/`.
2. Thêm `config.py`, `security.py` vào `app/core/`.
3. Thêm models (ví dụ: `user.py`, `item.py`) vào `app/models/`.
4. Thêm schemas (ví dụ: `user.py`, `item.py`) vào `app/schemas/`.
5. Thêm services (ví dụ: `user_service.py`, `item_service.py`) vào `app/services/`.
6. Thêm routers (ví dụ: `users.py`, `items.py`) vào `app/routers/`.

## Cài Đặt
1. Tạo virtual env: `python -m venv .venv && source .venv/bin/activate` (Linux/Mac) hoặc `.venv\Scripts\activate` (Windows).
2. `pip install -r requirements.txt`
3. Thêm code và chạy: `uvicorn app.main:app --reload` (sau khi tạo `main.py`).

## API Docs
Sau khi thêm code: http://localhost:8000/docs
