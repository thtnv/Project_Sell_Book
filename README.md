Phần backend
bước 1 : python -m venv venv ( nếu đã có venv thì chuyển sang bước 2 )
bước 2 :  .\venv\Scripts\Activate.ps1
bước 3 : pip install -r requirements.txt
bước 4 :  uvicorn app.main:app --reload

Mỗi lần cài đặt thư viện mới ( pip install ... ) thì thêm bước chạy lệnh pip freeze > requirements.txt để cập nhập thư viện trong file requirement.txt

Phần frontend
chạy npm run dev