import os
from pathlib import Path
from dotenv import load_dotenv
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import or_
from pydantic import BaseModel

# --- Import thư viện mới ---
from google import genai
from google.genai import types

from app.core.database import get_db
from app.models.book import Book
from app.schemas.chat import ChatRequest, ChatResponse

# Lấy đường dẫn tuyệt đối đến thư mục backend
BASE_DIR = Path(__file__).resolve().parent.parent.parent
ENV_PATH = BASE_DIR / ".env"
load_dotenv(ENV_PATH)

# Kiểm tra debug
api_key = os.getenv("GOOGLE_API_KEY")
print(f"DEBUG: Loading .env from {ENV_PATH}")
print(f"DEBUG: GOOGLE_API_KEY is {'SET' if api_key else 'NOT SET'}")

# --- 2. CẤU HÌNH GEMINI (LIBRARY MỚI) ---
client = None
if api_key:
    try:
        client = genai.Client(api_key=api_key)
    except Exception as e:
        print(f"⚠️ Lỗi khởi tạo Gemini Client: {e}")
else:
    print("⚠️ CẢNH BÁO: Chưa cấu hình GOOGLE_API_KEY.")

router = APIRouter(prefix="/chat", tags=["Chat"])


def get_shop_context(db: Session):
    """Lấy dữ liệu sách để dạy AI"""
    books = db.query(Book).limit(50).all()
    context_text = "Dữ liệu kho sách hiện tại:\n"
    for b in books:
        status = "Còn hàng" if b.stock_quantity > 0 else "Hết hàng"
        context_text += f"- {b.title} (Tác giả: {b.author}) - Giá: {float(b.price):,.0f}đ - {status}\n"
    return context_text


def fallback_search(db: Session, query: str):
    """Tìm kiếm cơ bản khi AI lỗi"""
    query = query.lower()
    books = (
        db.query(Book)
        .filter(or_(Book.title.ilike(f"%{query}%"), Book.author.ilike(f"%{query}%")))
        .limit(3)
        .all()
    )

    if not books:
        return "Hiện tại shop chưa tìm thấy sách bạn cần. Bạn thử tìm tên khác hoặc liên hệ hotline 089 931 8713 nhé!"

    msg = "Hệ thống AI đang bận, nhưng mình tìm thấy các sách này phù hợp với bạn:\n"
    for b in books:
        msg += f"📚 {b.title} - {float(b.price):,.0f}đ\n"
    return msg


@router.post("/", response_model=ChatResponse)
async def chat_with_ai(request: ChatRequest, db: Session = Depends(get_db)):
    user_msg = request.message
    print(f"📩 User hỏi: {user_msg}")

    # Nếu không có Client (do thiếu Key), dùng Fallback ngay
    if not client:
        return {"response": fallback_search(db, user_msg)}

    try:
        # Chuẩn bị dữ liệu
        inventory_context = get_shop_context(db)

        system_prompt = f"""
        VAI TRÒ: Bạn là trợ lý ảo chuyên tư vấn bán sách của 'Nhà sách UTE'.
        
        DỮ LIỆU KHO SÁCH (Sự thật duy nhất):
        {inventory_context}
        
        CÂU HỎI CỦA KHÁCH: "{user_msg}"
        
        NGUYÊN TẮC TRẢ LỜI (BẮT BUỘC TUÂN THỦ):
        1. PHẠM VI: CHỈ trả lời các câu hỏi liên quan đến: Sách, Tác giả, Giá cả, Tồn kho, Địa chỉ shop, Cách mua hàng.
        2. TỪ CHỐI NGOÀI LỀ: Nếu khách hỏi về vấn đề khác (thời tiết, chính trị, toán học, lập trình, tâm sự tuổi hồng...), hãy từ chối khéo léo và lái về chủ đề sách.
           - Ví dụ: "Dạ em chỉ là nhân viên bán sách nên không rành việc này ạ. Nhưng em có thể giới thiệu cho bạn vài cuốn sách hay, bạn thích thể loại nào?"
        3. TRUNG THỰC: Chỉ tư vấn sách có trong DỮ LIỆU KHO SÁCH ở trên. Không được bịa ra sách không có trong danh sách.
        4. THÔNG TIN SHOP: Nếu hỏi địa chỉ -> "48 Cao Thắng, Đà Nẵng". Hotline: "089 931 8713".
        5. VĂN PHONG: Ngắn gọn, thân thiện, không dùng icon.
        """

        # --- 3. GỌI GEMINI VỚI TÊN MODEL CỤ THỂ ---
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=system_prompt,
            config=types.GenerateContentConfig(
                temperature=0.7,
            ),
        )

        if not response.text:
            raise Exception("Empty response from AI")

        return {"response": response.text}

    except Exception as e:
        print(f"❌ AI Error: {str(e)}")
        # Nếu vẫn lỗi model, thử in ra danh sách model để debug (tuỳ chọn)
        # try:
        #     for m in client.models.list():
        #         print(m.name)
        # except: pass

        return {"response": fallback_search(db, user_msg)}
