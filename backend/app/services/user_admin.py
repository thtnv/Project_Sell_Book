from sqlalchemy.orm import Session
from sqlalchemy import select, func, or_
import uuid

from app.models.user import User
from app.schemas.user_admin import UserCreateAdmin, UserUpdateAdmin
from app.core.security import get_password_hash


def get_all_users(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    search: str = None,
    role_filter: str = None
):
    """Lấy danh sách users với filter và search"""
    stmt = select(User)
    
    # Search
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.full_name.like(search_pattern),
                User.email.like(search_pattern),
                User.phone.like(search_pattern)
            )
        )
    
    # Filter by role
    if role_filter:
        stmt = stmt.where(User.role == role_filter)
    
    stmt = stmt.offset(skip).limit(limit).order_by(User.created_at.desc())
    result = db.execute(stmt)
    return result.scalars().all()


def count_users(db: Session, search: str = None, role_filter: str = None) -> int:
    """Đếm tổng số users"""
    stmt = select(func.count()).select_from(User)
    
    if search:
        search_pattern = f"%{search}%"
        stmt = stmt.where(
            or_(
                User.full_name.like(search_pattern),
                User.email.like(search_pattern),
                User.phone.like(search_pattern)
            )
        )
    
    if role_filter:
        stmt = stmt.where(User.role == role_filter)
    
    return db.execute(stmt).scalar()


def get_user_by_id(db: Session, user_id: str):
    """Lấy user theo ID"""
    stmt = select(User).where(User.user_id == user_id)
    result = db.execute(stmt)
    return result.scalar_one_or_none()


def get_user_by_email(db: Session, email: str):
    """Lấy user theo email"""
    stmt = select(User).where(User.email == email)
    result = db.execute(stmt)
    return result.scalar_one_or_none()


def create_user(db: Session, user_data: UserCreateAdmin):
    """Tạo user mới (Admin)"""
    # Generate user ID
    new_user_id = f"U{str(uuid.uuid4().int)[:8]}"
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    new_user = User(
        user_id=new_user_id,
        full_name=user_data.full_name,
        email=user_data.email,
        password=hashed_password,  # Hash password
        phone=user_data.phone,
        address=user_data.address,
        role=user_data.role
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


def update_user(db: Session, user_id: str, user_data: UserUpdateAdmin):
    """Cập nhật thông tin user"""
    user = get_user_by_id(db, user_id)
    if not user:
        return None
    
    update_data = user_data.model_dump(exclude_unset=True)
    
    # Hash password nếu có thay đổi
    if 'password' in update_data and update_data['password']:
        update_data['password'] = get_password_hash(update_data['password'])
    
    for key, value in update_data.items():
        setattr(user, key, value)
    
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: str):
    """Xóa user"""
    user = get_user_by_id(db, user_id)
    if not user:
        return False
    
    db.delete(user)
    db.commit()
    return True