from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.schemas.user_admin import (
    UserCreateAdmin,
    UserUpdateAdmin,
    UserResponseAdmin,
    UserListResponseAdmin
)
from app.services import user_admin as user_service

router = APIRouter(prefix="/admin/users", tags=["Admin - Users"])


@router.get("/", response_model=UserListResponseAdmin)
async def get_all_users_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    search: Optional[str] = Query(None, description="Tìm kiếm theo tên, email, SĐT"),
    role: Optional[str] = Query(None, description="Lọc theo role: admin, customer"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy danh sách users (Admin) - có phân trang, search, filter"""
    
    try:
        users = user_service.get_all_users(db, skip, limit, search, role)
        total = user_service.count_users(db, search, role)
        
        return {"total": total, "users": users}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy danh sách users: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponseAdmin)
async def get_user_detail_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy chi tiết user theo ID (Admin)"""
    
    user = user_service.get_user_by_id(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Không tìm thấy user"
        )
    return user


@router.post("/", response_model=UserResponseAdmin, status_code=status.HTTP_201_CREATED)
async def create_user_admin(
    user_data: UserCreateAdmin,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Tạo user mới (Admin)"""
    
    try:
        # Kiểm tra email đã tồn tại
        existing_user = user_service.get_user_by_email(db, user_data.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email đã tồn tại"
            )
        
        new_user = user_service.create_user(db, user_data)
        return new_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi tạo user: {str(e)}"
        )


@router.put("/{user_id}", response_model=UserResponseAdmin)
async def update_user_admin(
    user_id: str,
    user_data: UserUpdateAdmin,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Cập nhật thông tin user (Admin)"""
    
    try:
        # Kiểm tra email mới có trùng không (nếu có thay đổi)
        if user_data.email:
            existing = user_service.get_user_by_email(db, user_data.email)
            if existing and existing.user_id != user_id:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email đã được sử dụng"
                )
        
        updated_user = user_service.update_user(db, user_id, user_data)
        if not updated_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy user"
            )
        
        return updated_user
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi cập nhật user: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_admin(
    user_id: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Xóa user (Admin)"""
    
    try:
        # Không cho phép admin tự xóa chính mình
        if user_id == current_admin.user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Không thể xóa tài khoản của chính mình"
            )
        
        success = user_service.delete_user(db, user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Không tìm thấy user"
            )
        
        return None
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi xóa user: {str(e)}"
        )