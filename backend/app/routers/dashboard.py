from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_, extract
from datetime import datetime, timedelta

from app.core.database import get_db
from app.core.dependencies import require_admin
from app.models.user import User
from app.models.order import Order
from app.models.order_status import OrderStatus
from app.models.book import Book

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_dashboard_stats(
    db: Session = Depends(get_db), current_admin: User = Depends(require_admin)
):
    """Lấy thống kê tổng quan cho dashboard"""

    try:
        # Tổng số users
        total_users = db.execute(select(func.count()).select_from(User)).scalar()
        total_customers = db.execute(
            select(func.count()).select_from(User).where(User.role == "customer")
        ).scalar()
        total_admins = db.execute(
            select(func.count()).select_from(User).where(User.role == "admin")
        ).scalar()

        # Tổng số đơn hàng
        total_orders = db.execute(select(func.count()).select_from(Order)).scalar()

        # Tổng doanh thu (chỉ đơn hoàn thành)
        total_revenue = db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .select_from(Order)
            .join(OrderStatus)
            .where(OrderStatus.status_name == "completed")
        ).scalar()

        # Tổng số sách
        total_books = db.execute(select(func.count()).select_from(Book)).scalar()
        total_stock = db.execute(
            select(func.coalesce(func.sum(Book.stock_quantity), 0)).select_from(Book)
        ).scalar()
        total_sold = db.execute(
            select(func.coalesce(func.sum(Book.sold_quantity), 0)).select_from(Book)
        ).scalar()

        return {
            "users": {
                "total": total_users or 0,
                "customers": total_customers or 0,
                "admins": total_admins or 0,
            },
            "orders": {"total": total_orders or 0},
            "revenue": {"total": float(total_revenue or 0)},
            "books": {
                "total": total_books or 0,
                "stock": total_stock or 0,
                "sold": total_sold or 0,
            },
        }
    except Exception as e:
        print(f"❌ Error in get_dashboard_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy thống kê: {str(e)}",
        )


@router.get("/order-status")
async def get_order_status_stats(
    db: Session = Depends(get_db), current_admin: User = Depends(require_admin)
):
    """Lấy thống kê đơn hàng theo trạng thái"""

    try:
        status_list = ["processing", "confirmed", "shipping", "completed", "cancelled"]

        result = {}
        for status_name in status_list:
            # Đếm số đơn hàng
            count = (
                db.execute(
                    select(func.count())
                    .select_from(Order)
                    .join(OrderStatus)
                    .where(OrderStatus.status_name == status_name)
                ).scalar()
                or 0
            )

            # Tính tổng tiền
            total = db.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0))
                .select_from(Order)
                .join(OrderStatus)
                .where(OrderStatus.status_name == status_name)
            ).scalar()

            result[status_name] = {"count": count, "amount": float(total or 0)}

        return result
    except Exception as e:
        print(f"❌ Error in get_order_status_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy thống kê trạng thái: {str(e)}",
        )


@router.get("/monthly-trends")
async def get_monthly_trends(
    year: int = Query(..., description="Năm cần xem báo cáo"),
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin),
):
    """
    Lấy dữ liệu biểu đồ theo 12 tháng của năm chỉ định.
    Trả về mảng 12 phần tử tương ứng tháng 1 -> 12.
    """
    try:
        # Khởi tạo mảng dữ liệu 12 tháng (index 0 = Tháng 1)
        months = [f"Tháng {i}" for i in range(1, 13)]

        # Init mảng chứa dữ liệu
        data_map = {
            "completed": [0] * 12,  # delivered
            "cancelled": [0] * 12,
            "processing": [0] * 12,
            "confirmed": [0] * 12,
            "shipping": [0] * 12,
            "revenue": [0] * 12,
        }

        # Query lấy dữ liệu group by tháng và trạng thái trong năm
        stmt = (
            select(
                extract("month", Order.created_at).label("month"),
                OrderStatus.status_name,
                func.count(Order.order_id).label("count"),
                func.sum(Order.total_amount).label("total"),
            )
            .join(OrderStatus, Order.status_id == OrderStatus.status_id)
            .where(extract("year", Order.created_at) == year)
            .group_by(extract("month", Order.created_at), OrderStatus.status_name)
        )

        results = db.execute(stmt).all()

        # Fill dữ liệu vào mảng
        for month, status_name, count, total in results:
            idx = int(month) - 1  # Index mảng (0-11)
            s_name = status_name.lower()

            if s_name in data_map:
                data_map[s_name][idx] = count

            # Doanh thu chỉ tính cho đơn hàng đã hoàn thành (completed/delivered)
            if s_name == "completed":
                data_map["revenue"][idx] = int(total or 0)

        return {
            "months": months,
            "delivered": data_map["completed"],
            "cancelled": data_map["cancelled"],
            "processing": data_map["processing"],
            "confirmed": data_map["confirmed"],
            "shipping": data_map["shipping"],
            "revenue": data_map["revenue"],
        }

    except Exception as e:
        print(f"❌ Error trends: {e}")
        raise HTTPException(status_code=500, detail=str(e))
