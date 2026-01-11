# backend/app/services/order.py
from decimal import Decimal
from sqlalchemy.orm import Session
from sqlalchemy import select
from fastapi import HTTPException
from datetime import datetime
import uuid
import logging

from app.models.order import Order
from app.models.order_detail import OrderDetail
from app.models.book import Book
from app.models.discount import Discount
from app.models.discount_application import DiscountApplication
from app.models.payment_method import PaymentMethod
from app.models.order_status import OrderStatus
from app.models.user import User
from app.schemas.order import OrderCreate
from app.services.email import send_order_confirmation_email, send_order_status_update_email

logger = logging.getLogger(__name__)

def generate_order_id(db: Session) -> str:
    stmt = select(Order).order_by(Order.created_at.desc())
    last_order = db.execute(stmt).scalars().first()
    if not last_order: return "ORD00001"
    try:
        new_num = int(last_order.order_id[3:]) + 1
        return f"ORD{new_num:05d}"
    except: return f"ORD{str(uuid.uuid4().int)[:8]}"

def create_order(db: Session, order_data: OrderCreate):
    try:
        user = db.execute(select(User).where(User.user_id == order_data.user_id)).scalar_one_or_none()
        if not user: raise HTTPException(status_code=404, detail="User không tồn tại")

        subtotal = Decimal(0)
        email_items = []
        order_items = []
        
        for item in order_data.items:
            book = db.execute(select(Book).where(Book.book_id == item.book_id)).scalar_one_or_none()
            if not book or book.stock_quantity < item.quantity:
                raise HTTPException(status_code=400, detail=f"Sách {item.book_id} không đủ hàng")
            
            line_total = Decimal(str(book.price)) * item.quantity
            subtotal += line_total
            order_items.append({'book': book, 'quantity': item.quantity, 'price': book.price})
            email_items.append({'title': book.title, 'quantity': item.quantity, 'price': float(book.price)})

        shipping_fee = Decimal('30000')
        final_total = subtotal + shipping_fee
        discount_id = None
        
        if order_data.voucher_code:
            discount = db.execute(select(Discount).where(Discount.voucher_code == order_data.voucher_code)).scalar_one_or_none()
            if discount and discount.expiry_date >= datetime.utcnow():
                final_total -= subtotal * (Decimal(str(discount.discount_percentage)) / 100)
                discount_id = discount.discount_id

        # CHANGED: Trạng thái mặc định là 'processing' (Chờ xử lý)
        status_rec = db.execute(select(OrderStatus).where(OrderStatus.status_name == 'processing')).scalar_one()
        new_id = generate_order_id(db)
        
        new_order = Order(
            order_id=new_id, user_id=order_data.user_id, total_amount=final_total,
            shipping_address=order_data.shipping_address, payment_method_id=order_data.payment_method_id,
            status_id=status_rec.status_id, created_at=datetime.utcnow()
        )
        db.add(new_order); db.flush()

        for it in order_items:
            db.add(OrderDetail(order_id=new_id, book_id=it['book'].book_id, quantity=it['quantity'], unit_price=it['price']))
            it['book'].stock_quantity -= it['quantity']
            it['book'].sold_quantity += it['quantity']

        if discount_id:
            db.add(DiscountApplication(order_id=new_id, discount_id=discount_id))

        db.commit(); db.refresh(new_order)

        try:
            email_payload = {
                'items': email_items, 'subtotal': float(subtotal), 'total_amount': float(final_total),
                'shipping_address': order_data.shipping_address, 'payment_method_id': order_data.payment_method_id
            }
            send_order_confirmation_email(user.email, user.full_name, new_id, email_payload)
        except Exception as e: logger.error(f"Lỗi gửi mail: {e}")

        return new_order
    except Exception as e:
        db.rollback(); raise e


def get_user_orders(db: Session, user_id: str):
    """Lấy danh sách đơn hàng của user"""
    stmt = select(Order).where(Order.user_id == user_id).order_by(Order.created_at.desc())
    result = db.execute(stmt)
    return result.scalars().all()


def get_order_by_id(db: Session, order_id: str):
    """Lấy đơn hàng theo ID"""
    stmt = select(Order).where(Order.order_id == order_id)
    result = db.execute(stmt)
    order = result.scalar_one_or_none()
    
    if not order:
        raise HTTPException(status_code=404, detail="Không tìm thấy đơn hàng")
    
    return order


def cancel_order(db: Session, order_id: str, user_id: str):
    """
    Hủy đơn hàng - CHỈ cho phép khi đơn đang ở trạng thái 'processing' (Chờ xử lý)
    """
    order = get_order_by_id(db, order_id)
    
    # Check permission
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền hủy đơn hàng này")
    
    # CHANGED: Chỉ cho phép hủy khi đang "Chờ xử lý"
    if order.status.status_name != 'processing':
        raise HTTPException(
            status_code=400, 
            detail="Chỉ có thể hủy đơn hàng đang chờ xử lý"
        )
    
    # Update status to cancelled
    cancelled_status = db.execute(
        select(OrderStatus).where(OrderStatus.status_name == 'cancelled')
    ).scalar_one()
    
    order.status_id = cancelled_status.status_id
    
    # Restore stock
    for detail in order.order_details:
        detail.book.stock_quantity += detail.quantity
        detail.book.sold_quantity -= detail.quantity
    
    db.commit()
    db.refresh(order)
    
    # Send notification email
    user = order.user
    if user:
        try:
            send_order_status_update_email(
                user.email, 
                user.full_name, 
                order_id, 
                'processing', 
                'cancelled'
            )
        except Exception as e:
            logger.error(f"Lỗi gửi mail hủy đơn: {e}")
    
    return order


def update_order_status(db: Session, order_id: str, new_status: str):
    """
    Cập nhật trạng thái đơn hàng (Admin)
    Flow: processing -> confirmed -> shipping -> completed
    """
    order = get_order_by_id(db, order_id)
    
    # Validate status transitions
    current_status = order.status.status_name if order.status else None
    
    # CHANGED: Logic chuyển trạng thái mới
    valid_transitions = {
        'processing': ['confirmed', 'cancelled'],  # Chờ xử lý -> Đang xử lý hoặc Hủy
        'confirmed': ['shipping'],                  # Đang xử lý -> Đang giao
        'shipping': ['completed'],                  # Đang giao -> Đã giao (do user xác nhận)
        'completed': [],                            # Đã giao -> không chuyển được
        'cancelled': []                             # Đã hủy -> không chuyển được
    }
    
    if current_status not in valid_transitions:
        raise HTTPException(status_code=400, detail=f"Trạng thái hiện tại không hợp lệ")
    
    if new_status not in valid_transitions[current_status]:
        raise HTTPException(
            status_code=400, 
            detail=f"Không thể chuyển từ '{current_status}' sang '{new_status}'"
        )
    
    status_obj = db.execute(
        select(OrderStatus).where(OrderStatus.status_name == new_status)
    ).scalar_one_or_none()
    
    if not status_obj:
        raise HTTPException(status_code=404, detail="Không tìm thấy trạng thái")
    
    old_status = current_status
    order.status_id = status_obj.status_id
    
    db.commit()
    db.refresh(order)
    
    # Send email notification
    user = order.user
    if user:
        try:
            send_order_status_update_email(user.email, user.full_name, order_id, old_status, new_status)
        except Exception as e:
            logger.error(f"Lỗi gửi mail: {e}")
    
    return order


def confirm_delivery(db: Session, order_id: str, user_id: str):
    """
    User xác nhận đã nhận hàng - Chuyển từ 'shipping' -> 'completed'
    """
    order = get_order_by_id(db, order_id)
    
    # Check permission
    if order.user_id != user_id:
        raise HTTPException(status_code=403, detail="Bạn không có quyền xác nhận đơn hàng này")
    
    # CHANGED: Chỉ cho phép xác nhận khi đang "Đang giao"
    if order.status.status_name != 'shipping':
        raise HTTPException(
            status_code=400, 
            detail="Chỉ có thể xác nhận đơn hàng đang giao"
        )
    
    # Update to completed
    completed_status = db.execute(
        select(OrderStatus).where(OrderStatus.status_name == 'completed')
    ).scalar_one()
    
    order.status_id = completed_status.status_id
    
    db.commit()
    db.refresh(order)
    
    return order