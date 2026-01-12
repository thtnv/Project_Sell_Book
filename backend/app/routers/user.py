from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from datetime import datetime
from app.core.security import get_password_hash, verify_password, create_access_token
from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.schemas.user import (
    RegisterUserSchema,
    RegisterResponseSchema,
    LoginSchema,
    ChangePasswordSchema,
    TokenSchema,
)
from app.schemas.user_profile import UserProfileUpdate, UserProfileResponse
from app.core.security import create_access_token, get_password_hash
from app.schemas.user import SocialLoginRequest, TokenSchema
import requests
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter(prefix="/users", tags=["Users"])


def generate_user_id(db: Session):
    stmt = select(User.user_id).order_by(desc(User.user_id)).limit(1)
    last_id = db.execute(stmt).scalar_one_or_none()

    if not last_id:
        return "U001"

    number = int(last_id[1:])
    new_number = number + 1

    return f"U{new_number:03d}"


@router.post(
    "/register",
    response_model=RegisterResponseSchema,
    status_code=status.HTTP_201_CREATED,
)
async def register_user(user_data: RegisterUserSchema, db: Session = Depends(get_db)):
    """Đăng ký tài khoản mới"""
    # Kiểm tra email tồn tại
    stmt = select(User).where(User.email == user_data.email)
    exist_user = db.execute(stmt).scalar_one_or_none()
    if exist_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email đã tồn tại"
        )

    # Kiểm tra số điện thoại
    if user_data.phone:
        stmt = select(User).where(User.phone == user_data.phone)
        exist_phone = db.execute(stmt).scalar_one_or_none()
        if exist_phone:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Số điện thoại đã được sử dụng",
            )

    # Tạo user mới
    import uuid

    new_user_id = generate_user_id(db)
    hashed_pwd = get_password_hash(user_data.password)

    new_user = User(
        user_id=new_user_id,
        full_name=user_data.username,
        email=user_data.email,
        password=hashed_pwd,
        phone=user_data.phone,
        address=user_data.address,
        role="customer",
        created_at=datetime.utcnow(),
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.user_id,
        "fullname": new_user.full_name,
        "email": new_user.email,
        "phone": new_user.phone,
        "address": new_user.address,
        "created_at": new_user.created_at,
    }


@router.post("/login", response_model=TokenSchema)
async def login(login_data: LoginSchema, db: Session = Depends(get_db)):
    """Đăng nhập"""
    # Tìm user theo phone hoặc email
    stmt = select(User).where(
        (User.phone == login_data.phone) | (User.email == login_data.phone)
    )
    user = db.execute(stmt).scalar_one_or_none()

    if not user or not verify_password(login_data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Thông tin đăng nhập không đúng",
        )

    # Tạo token
    access_token = create_access_token(
        data={"user_id": user.user_id, "email": user.email, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.user_id,
            "fullname": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role,
            "created_at": user.created_at.isoformat() if user.created_at else None,
        },
    }


# ============= PROFILE ENDPOINTS =============


@router.get("/me", response_model=UserProfileResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user), db: Session = Depends(get_db)
):
    """Lấy thông tin profile của user hiện tại"""
    return {
        "user_id": current_user.user_id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "address": current_user.address,
        "role": current_user.role,
    }


@router.put("/me", response_model=UserProfileResponse)
async def update_user_profile(
    profile_data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Cập nhật thông tin cá nhân (user tự cập nhật)"""
    try:
        has_changes = False

        # Cập nhật full_name
        if profile_data.full_name is not None and profile_data.full_name.strip():
            if profile_data.full_name != current_user.full_name:
                current_user.full_name = profile_data.full_name
                has_changes = True

        # Cập nhật phone
        if profile_data.phone is not None:
            # Normalize: empty string -> None
            new_phone = profile_data.phone.strip() if profile_data.phone else None

            if new_phone != current_user.phone:
                # Kiểm tra phone trùng (nếu không phải None hoặc empty)
                if new_phone:
                    existing = db.execute(
                        select(User).where(
                            User.phone == new_phone,
                            User.user_id != current_user.user_id,
                        )
                    ).scalar_one_or_none()

                    if existing:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Số điện thoại đã được sử dụng",
                        )

                current_user.phone = new_phone
                has_changes = True

        # Cập nhật address
        if profile_data.address is not None:
            # Normalize: empty string -> None
            new_address = profile_data.address.strip() if profile_data.address else None

            if new_address != current_user.address:
                current_user.address = new_address
                has_changes = True

        # Kiểm tra có thay đổi không
        if not has_changes:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không có thay đổi nào để cập nhật",
            )

        db.commit()
        db.refresh(current_user)

        return {
            "user_id": current_user.user_id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "phone": current_user.phone,
            "address": current_user.address,
            "role": current_user.role,
        }

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật thông tin: {str(e)}",
        )


@router.get("/admin/users", dependencies=[Depends(require_admin)])
async def get_all_users(db: Session = Depends(get_db), skip: int = 0, limit: int = 100):
    """Admin xem danh sách users"""
    from sqlalchemy import func

    total = db.execute(select(func.count()).select_from(User)).scalar()
    users = db.execute(select(User).offset(skip).limit(limit)).scalars().all()

    return {
        "total": total,
        "users": [
            {
                "id": u.user_id,
                "fullname": u.full_name,
                "email": u.email,
                "role": u.role,
                "created_at": u.created_at,
            }
            for u in users
        ],
    }


# ============= SOCIAL LOGIN ENDPOINT =============
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")


@router.post("/login/social", response_model=TokenSchema)
async def login_social(login_data: SocialLoginRequest, db: Session = Depends(get_db)):
    email = ""
    fullname = ""

    # 1. XỬ LÝ GOOGLE (Dùng Access Token từ Frontend gửi lên)
    if login_data.provider == "google":
        try:
            # Gọi API userinfo của Google để xác thực token và lấy thông tin
            res = requests.get(
                "https://www.googleapis.com/oauth2/v3/userinfo",
                headers={"Authorization": f"Bearer {login_data.token}"},
            )

            if res.status_code != 200:
                raise HTTPException(status_code=400, detail="Google Token không hợp lệ")

            data = res.json()
            email = data.get("email")
            fullname = data.get("name", "Google User")

        except Exception as e:
            print(f"Google Login Error: {e}")
            raise HTTPException(status_code=400, detail="Lỗi kết nối Google")

    # 2. XỬ LÝ FACEBOOK (Dùng Access Token)
    elif login_data.provider == "facebook":
        try:
            # Gọi Graph API
            url = f"https://graph.facebook.com/me?access_token={login_data.token}&fields=id,name,email"
            response = requests.get(url)
            data = response.json()

            if "error" in data:
                raise HTTPException(
                    status_code=400, detail="Facebook Token không hợp lệ"
                )

            email = data.get("email")
            fullname = data.get("name", "Facebook User")

            # Fallback nếu FB không trả về email (do user đăng ký bằng SĐT)
            if not email:
                email = f"{data['id']}@facebook.com"

        except Exception:
            raise HTTPException(status_code=400, detail="Lỗi kết nối Facebook")

    else:
        raise HTTPException(status_code=400, detail="Provider không hỗ trợ")

    # --- LOGIC TÌM HOẶC TẠO USER (Giống code cũ) ---
    stmt = select(User).where(User.email == email)
    user = db.execute(stmt).scalar_one_or_none()

    if not user:
        # Tạo user mới
        import uuid
        from app.core.security import get_password_hash

        new_user = User(
            user_id=generate_user_id(db),
            full_name=fullname,
            email=email,
            password=get_password_hash(str(uuid.uuid4())),  # Pass ngẫu nhiên
            role="customer",
            phone="",
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        user = new_user

    # Tạo Token JWT của ứng dụng
    from app.core.security import create_access_token

    access_token = create_access_token(
        data={"user_id": user.user_id, "sub": user.email, "role": user.role}
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.user_id,
            "fullname": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "address": user.address,
            "role": user.role,
            "created_at": str(user.created_at) if user.created_at else None,
        },
    }


# ============ CHANGE PASSWORD ENDPOINT =============
@router.put("/me/password", status_code=status.HTTP_200_OK)
async def update_password(
    password_data: ChangePasswordSchema,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Đổi mật khẩu cho user đang đăng nhập"""
    try:
        # Hash mật khẩu mới
        hashed_password = get_password_hash(password_data.password)

        # Cập nhật vào DB
        current_user.password = hashed_password
        db.commit()

        return {"message": "Đổi mật khẩu thành công"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi đổi mật khẩu: {str(e)}",
        )
