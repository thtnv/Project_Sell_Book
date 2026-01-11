from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.core.dependencies import require_admin, get_current_user
from app.models.user import User
from app.schemas.contact import (
    ContactCreate, 
    ContactReply, 
    ContactResponse, 
    ContactListResponse,
    NotificationResponse
)
from app.services import contact as contact_service

router = APIRouter(prefix="/contacts", tags=["Contacts"])


# 1. Gửi liên hệ mới (Khách hàng hoặc Guest)
@router.post("/", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
async def create_contact(
    contact_data: ContactCreate, 
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user)
):
    """
    Gửi liên hệ mới.
    - Nếu đã đăng nhập: Tự động lấy thông tin từ user
    - Nếu chưa đăng nhập: Phải nhập full_name và email
    """
    # Nếu đã đăng nhập, tự động gán user_id và thông tin
    if current_user:
        contact_data.user_id = current_user.user_id
        contact_data.full_name = current_user.full_name
        contact_data.email = current_user.email
    
    return contact_service.create(db, contact_data)


# 2. Lấy danh sách liên hệ (ADMIN) - Có phân trang và lọc
@router.get("/admin", response_model=ContactListResponse, dependencies=[Depends(require_admin)])
async def get_contacts_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    status_filter: Optional[str] = Query(None, description="Filter by status: pending, resolved"),
    db: Session = Depends(get_db)
):
    """
    Lấy danh sách liên hệ (ADMIN) - có phân trang và filter
    """
    contacts = contact_service.get_all(db, skip, limit, status_filter)
    total = contact_service.count_contacts(db, status_filter)
    
    return {
        "total": total,
        "contacts": contacts
    }


# 3. Lấy chi tiết liên hệ theo ID (ADMIN)
@router.get("/admin/{contact_id}", response_model=ContactResponse, dependencies=[Depends(require_admin)])
async def get_contact_detail_admin(
    contact_id: int, 
    db: Session = Depends(get_db)
):
    """Lấy chi tiết liên hệ theo ID (ADMIN)"""
    contact = contact_service.get_by_id(db, contact_id)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Contact not found"
        )
    return contact


# 4. Phản hồi liên hệ (ADMIN)
@router.put("/admin/{contact_id}/reply", response_model=ContactResponse, dependencies=[Depends(require_admin)])
async def reply_contact_admin(
    contact_id: int, 
    reply_data: ContactReply, 
    db: Session = Depends(get_db)
):
    """Phản hồi liên hệ (ADMIN)"""
    contact = contact_service.respond(db, contact_id, reply_data)
    if not contact:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Contact not found"
        )
    return contact


# 5. Xoá liên hệ (ADMIN)
@router.delete("/admin/{contact_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=[Depends(require_admin)])
async def delete_contact_admin(
    contact_id: int, 
    db: Session = Depends(get_db)
):
    """Xoá liên hệ (ADMIN)"""
    success = contact_service.delete(db, contact_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Contact not found"
        )
    return None


# 6. Lấy danh sách liên hệ của user hiện tại (Khách hàng)
@router.get("/my-contacts", response_model=List[ContactResponse])
async def get_my_contacts(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Lấy danh sách liên hệ của user hiện tại"""
    return contact_service.get_by_user_id(db, current_user.user_id)


# 7. MỚI: Lấy thông báo (chỉ những liên hệ đã được admin trả lời)
@router.get("/notifications", response_model=List[NotificationResponse])
async def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Lấy thông báo cho user hiện tại
    Chỉ trả về những liên hệ đã được admin phản hồi (status = 'resolved')
    """
    return contact_service.get_user_notifications(db, current_user.user_id)