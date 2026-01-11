from sqlalchemy.orm import Session
from sqlalchemy import select, func
from datetime import datetime
from fastapi import HTTPException
from typing import Optional

from app.models.contact import Contact
from app.models.user import User
from app.schemas.contact import ContactCreate, ContactReply


def get_all(
    db: Session, 
    skip: int = 0, 
    limit: int = 100, 
    status_filter: Optional[str] = None
):
    """Lấy danh sách liên hệ với phân trang và filter"""
    stmt = select(Contact)
    
    if status_filter:
        stmt = stmt.where(Contact.status == status_filter)
    
    stmt = stmt.order_by(Contact.sent_at.desc()).offset(skip).limit(limit)
    result = db.execute(stmt)
    return result.scalars().all()


def count_contacts(db: Session, status_filter: Optional[str] = None) -> int:
    """Đếm tổng số liên hệ"""
    stmt = select(func.count()).select_from(Contact)
    
    if status_filter:
        stmt = stmt.where(Contact.status == status_filter)
    
    return db.execute(stmt).scalar()


def get_by_id(db: Session, contact_id: int):
    """Lấy chi tiết liên hệ theo ID"""
    stmt = select(Contact).where(Contact.contact_id == contact_id)
    result = db.execute(stmt)
    return result.scalar_one_or_none()


def get_by_user_id(db: Session, user_id: str):
    """Lấy danh sách liên hệ của một user"""
    stmt = select(Contact).where(Contact.user_id == user_id).order_by(Contact.sent_at.desc())
    result = db.execute(stmt)
    return result.scalars().all()


def create(db: Session, contact_data: ContactCreate):
    """Gửi liên hệ mới"""
    # Khởi tạo biến
    final_full_name = contact_data.full_name
    final_email = contact_data.email

    # TH1: Có User ID -> Tự động lấy thông tin từ bảng Users
    if contact_data.user_id:
        stmt = select(User).where(User.user_id == contact_data.user_id)
        user = db.execute(stmt).scalar_one_or_none()
        
        if not user:
            raise HTTPException(status_code=404, detail="User ID not found")

        final_full_name = user.full_name
        final_email = user.email

    # TH2: Khách vãng lai -> Bắt buộc nhập tay
    else:
        if not final_full_name or not final_email:
            raise HTTPException(
                status_code=400, 
                detail="Full name and Email are required for guests"
            )

    # Tạo record mới
    new_contact = Contact(
        user_id=contact_data.user_id,
        full_name=final_full_name,
        email=final_email,
        subject=contact_data.subject,
        message=contact_data.message,
        status="pending",
        sent_at=datetime.utcnow(),
    )
    
    db.add(new_contact)
    db.commit()
    db.refresh(new_contact)
    return new_contact


def respond(db: Session, contact_id: int, reply_data: ContactReply):
    """Admin phản hồi liên hệ"""
    contact = get_by_id(db, contact_id)
    if not contact:
        return None

    contact.admin_response = reply_data.admin_response
    contact.status = "resolved"
    contact.responded_at = datetime.utcnow()

    db.commit()
    db.refresh(contact)
    return contact


def delete(db: Session, contact_id: int):
    """Xóa liên hệ"""
    contact = get_by_id(db, contact_id)
    if not contact:
        return False

    db.delete(contact)
    db.commit()
    return True

def get_all_admin(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(Contact)
        .order_by(
            Contact.status.asc(),  # 'pending' hiện lên trước 'resolved'
            Contact.user_id.asc(),  # Nhóm tin nhắn của cùng 1 user
            Contact.sent_at.desc(),  # Tin nhắn mới nhất hiện lên đầu
        )
        .offset(skip)
        .limit(limit)
        .all()
    )


# 7. Thêm hàm lấy thông báo cho KHÁCH HÀNG
def get_user_notifications(db: Session, user_id: str):
    return (
        db.query(Contact)
        .filter(
            Contact.user_id == user_id,
            Contact.status == "resolved",  # Chỉ lấy những tin đã được phản hồi
        )
        .order_by(Contact.responded_at.desc())
        .all()
    )