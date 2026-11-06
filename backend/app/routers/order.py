# backend/app/routers/order.py
from fastapi import APIRouter, Body, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select, func, desc
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_admin
from app.models.user import User
from app.models.order import Order
from app.models.order_detail import OrderDetail  # ← FIX: Thêm import này
from app.models.order_status import OrderStatus  # ← FIX: Thêm import này
from app.schemas.order import OrderCreate, OrderResponse, UserOrderHistoryResponse
from app.services import order as order_service
from app.models.discount import Discount

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_order(
    order_data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Tạo đơn hàng mới"""
    try:
        order_data.user_id = current_user.user_id
        # GIẢI NÉN TUPLE TRẢ VỀ TỪ SERVICE
        order, payment_info = order_service.create_order(db, order_data)

        # Trả về dữ liệu kết hợp giữa Order Object và Payment Info
        return {
            "order_id": order.order_id,
            "user_id": order.user_id,
            "total_amount": float(order.total_amount),
            "status_id": order.status_id,
            "order_status": (
                order.status.status_name if order.status else "processing"
            ),
            "shipping_address": order.shipping_address,
            "payment_method_id": order.payment_method_id,
            "payment_method_name": (
                order.payment_method.method_name if order.payment_method else None
            ),
            "created_at": order.created_at.isoformat(),
            # THÔNG TIN THANH TOÁN (Cho Frontend redirect)
            "is_stripe": payment_info.get("is_stripe"),
            "payment_url": payment_info.get("payment_url"),
            "order_details": [
                {
                    "detail_id": detail.detail_id,
                    "book_id": detail.book_id,
                    "quantity": detail.quantity,
                    "unit_price": float(detail.unit_price),
                    "book": (
                        {
                            "book_id": detail.book.book_id,
                            "title": detail.book.title,
                            "cover_image_url": detail.book.cover_image_url,
                        }
                        if detail.book
                        else None
                    ),
                }
                for detail in order.order_details
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.get("/my-orders", response_model=UserOrderHistoryResponse)
async def get_my_orders(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, description="Lọc theo trạng thái"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy lịch sử đơn hàng của user hiện tại với phân trang"""
    try:
        # Build query
        stmt = (
            select(Order)
            .options(
                joinedload(Order.status),
                joinedload(Order.payment_method),
                joinedload(Order.order_details).joinedload(OrderDetail.book),
            )
            .where(Order.user_id == current_user.user_id)
        )

        # Filter by status if provided
        if status_filter:
            stmt = stmt.join(OrderStatus).where(
                OrderStatus.status_name == status_filter
            )

        # Count total
        count_stmt = (
            select(func.count())
            .select_from(Order)
            .where(Order.user_id == current_user.user_id)
        )
        if status_filter:
            count_stmt = count_stmt.join(OrderStatus).where(
                OrderStatus.status_name == status_filter
            )

        total = db.execute(count_stmt).scalar()

        # Get paginated results
        stmt = stmt.order_by(desc(Order.created_at)).offset(skip).limit(limit)
        result = db.execute(stmt)
        orders = result.scalars().unique().all()

        # Format response
        orders_data = []
        for order in orders:
            order_dict = {
                "order_id": order.order_id,
                "user_id": order.user_id,
                "total_amount": float(order.total_amount),
                "status_id": order.status_id,
                "order_status": order.status.status_name if order.status else "unknown",
                "shipping_address": order.shipping_address,
                "payment_method_id": order.payment_method_id,
                "payment_method_name": (
                    order.payment_method.method_name if order.payment_method else None
                ),
                "created_at": order.created_at.isoformat(),
                "order_details": [],
            }

            # Add order details
            for detail in order.order_details:
                detail_dict = {
                    "detail_id": detail.detail_id,
                    "book_id": detail.book_id,
                    "quantity": detail.quantity,
                    "unit_price": float(detail.unit_price),
                    "book": None,
                }

                if detail.book:
                    detail_dict["book"] = {
                        "book_id": detail.book.book_id,
                        "title": detail.book.title,
                        "cover_image_url": detail.book.cover_image_url,
                    }

                order_dict["order_details"].append(detail_dict)

            orders_data.append(order_dict)

        return {"total": total, "orders": orders_data}

    except Exception as e:
        print(f"❌ ERROR in get_my_orders: {str(e)}")
        import traceback

        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy lịch sử đơn hàng: {str(e)}",
        )


@router.get("/{order_id}")
async def get_order_detail(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Lấy chi tiết đơn hàng"""
    try:
        stmt = (
            select(Order)
            .options(
                joinedload(Order.user),
                joinedload(Order.status),
                joinedload(Order.payment_method),
                joinedload(Order.order_details).joinedload(OrderDetail.book),
            )
            .where(Order.order_id == order_id)
        )

        result = db.execute(stmt)
        order = result.unique().scalar_one_or_none()

        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Không tìm thấy đơn hàng"
            )

        # Check permission
        if current_user.role != "admin" and order.user_id != current_user.user_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Bạn không có quyền xem đơn hàng này",
            )

        return {
            "order_id": order.order_id,
            "user_id": order.user_id,
            "user_name": order.user.full_name if order.user else order.user_id,
            "user_phone": order.user.phone if order.user else None,
            "user_email": order.user.email if order.user else None,
            "total_amount": float(order.total_amount),
            "status_id": order.status_id,
            "order_status": order.status.status_name if order.status else "unknown",
            "shipping_address": order.shipping_address,
            "payment_method_id": order.payment_method_id,
            "payment_method_name": (
                order.payment_method.method_name if order.payment_method else None
            ),
            "created_at": order.created_at.isoformat(),
            "order_details": [
                {
                    "detail_id": detail.detail_id,
                    "book_id": detail.book_id,
                    "quantity": detail.quantity,
                    "unit_price": float(detail.unit_price),
                    "book": (
                        {
                            "book_id": detail.book.book_id,
                            "title": detail.book.title,
                            "cover_image_url": detail.book.cover_image_url,
                        }
                        if detail.book
                        else None
                    ),
                }
                for detail in order.order_details
            ],
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/{order_id}/cancel")
async def cancel_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Hủy đơn hàng"""
    order = order_service.cancel_order(db, order_id, current_user.user_id)

    return {
        "message": "Hủy đơn hàng thành công",
        "order_id": order.order_id,
        "order_status": order.status.status_name if order.status else "unknown",
    }


@router.put("/{order_id}/confirm-delivery")
async def confirm_delivery_order(
    order_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """User xác nhận đã nhận hàng - Chuyển từ 'shipping' -> 'completed'"""
    try:
        # Gọi hàm confirm_delivery từ service
        order = order_service.confirm_delivery(db, order_id, current_user.user_id)

        return {
            "message": "Xác nhận nhận hàng thành công",
            "order_id": order.order_id,
            "order_status": order.status.status_name if order.status else "unknown",
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


# Admin endpoints
@router.get("/admin/all")
async def get_all_orders_admin(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Lấy tất cả đơn hàng (Admin)"""
    try:
        stmt = select(Order).options(
            joinedload(Order.user),
            joinedload(Order.status),
            joinedload(Order.payment_method),
        )

        if status_filter:
            stmt = stmt.join(OrderStatus).where(
                OrderStatus.status_name == status_filter
            )

        count_stmt = select(func.count()).select_from(Order)
        if status_filter:
            count_stmt = count_stmt.join(OrderStatus).where(
                OrderStatus.status_name == status_filter
            )

        total = db.execute(count_stmt).scalar()

        stmt = (
            stmt.order_by(Order.status_id.asc(), desc(Order.created_at))
            .offset(skip)
            .limit(limit)
        )
        result = db.execute(stmt)
        orders = result.scalars().unique().all()

        return {
            "total": total,
            "orders": [
                {
                    "order_id": order.order_id,
                    "user_id": order.user_id,
                    "user_name": order.user.full_name if order.user else "N/A",
                    "total_amount": float(order.total_amount),
                    "order_status": (
                        order.status.status_name if order.status else "unknown"
                    ),
                    "created_at": order.created_at.isoformat(),
                }
                for order in orders
            ],
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.put("/admin/{order_id}/status")
async def update_order_status_admin(
    order_id: str,
    new_status: str,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """Cập nhật trạng thái đơn hàng (Admin only)"""
    order = order_service.update_order_status(db, order_id, new_status)

    return {
        "message": "Cập nhật trạng thái thành công",
        "order_id": order.order_id,
        "new_status": order.status.status_name,
    }


@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_order_endpoint(
    order_id: str,
    db: Session = Depends(get_db),
    # Không bắt buộc login để xóa lúc redirect, hoặc bạn có thể yêu cầu user login
):
    """Xóa đơn hàng (Dùng cho webhook hoặc cancel page)"""
    try:
        order_service.delete_order(db, order_id)
        return None
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e)
        )


@router.post("/validate-voucher")
async def validate_voucher(
    voucher_code: str = Body(..., embed=True), db: Session = Depends(get_db)
):
    """Kiểm tra mã giảm giá có hợp lệ không"""
    from datetime import datetime

    discount = db.execute(
        select(Discount).where(Discount.voucher_code == voucher_code)
    ).scalar_one_or_none()

    if not discount:
        raise HTTPException(status_code=404, detail="Mã giảm giá không tồn tại")

    if discount.expiry_date < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Mã giảm giá đã hết hạn")

    return {
        "voucher_code": discount.voucher_code,
        "discount_percentage": float(discount.discount_percentage),
        "message": "Áp dụng mã giảm giá thành công",
    }
