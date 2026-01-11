from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
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
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy thống kê tổng quan cho dashboard"""
    
    try:
        # Tổng số users
        total_users = db.execute(select(func.count()).select_from(User)).scalar()
        total_customers = db.execute(
            select(func.count()).select_from(User).where(User.role == 'customer')
        ).scalar()
        total_admins = db.execute(
            select(func.count()).select_from(User).where(User.role == 'admin')
        ).scalar()
        
        # Tổng số đơn hàng
        total_orders = db.execute(select(func.count()).select_from(Order)).scalar()
        
        # Tổng doanh thu (chỉ đơn hoàn thành)
        total_revenue = db.execute(
            select(func.coalesce(func.sum(Order.total_amount), 0))
            .select_from(Order)
            .join(OrderStatus)
            .where(OrderStatus.status_name == 'completed')
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
                "admins": total_admins or 0
            },
            "orders": {
                "total": total_orders or 0
            },
            "revenue": {
                "total": float(total_revenue or 0)
            },
            "books": {
                "total": total_books or 0,
                "stock": total_stock or 0,
                "sold": total_sold or 0
            }
        }
    except Exception as e:
        print(f"❌ Error in get_dashboard_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy thống kê: {str(e)}"
        )


@router.get("/order-status")
async def get_order_status_stats(
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy thống kê đơn hàng theo trạng thái"""
    
    try:
        status_list = ['processing', 'confirmed', 'shipping', 'completed', 'cancelled']
        
        result = {}
        for status_name in status_list:
            # Đếm số đơn hàng
            count = db.execute(
                select(func.count())
                .select_from(Order)
                .join(OrderStatus)
                .where(OrderStatus.status_name == status_name)
            ).scalar() or 0
            
            # Tính tổng tiền
            total = db.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0))
                .select_from(Order)
                .join(OrderStatus)
                .where(OrderStatus.status_name == status_name)
            ).scalar()
            
            result[status_name] = {
                "count": count,
                "amount": float(total or 0)
            }
        
        return result
    except Exception as e:
        print(f"❌ Error in get_order_status_stats: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy thống kê trạng thái: {str(e)}"
        )


@router.get("/monthly-trends")
async def get_monthly_trends(
    months: int = 5,
    db: Session = Depends(get_db),
    current_admin: User = Depends(require_admin)
):
    """Lấy xu hướng theo tháng"""
    
    try:
        month_labels = []
        delivered = []
        cancelled = []
        revenue = []
        
        # Lấy dữ liệu cho N tháng gần nhất
        for i in range(months, 0, -1):
            # Tính tháng
            target_date = datetime.now() - timedelta(days=30 * i)
            month_label = target_date.strftime('T%m')
            month_labels.append(month_label)
            
            # Tính khoảng thời gian của tháng
            month_start = target_date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            if month_start.month == 12:
                month_end = month_start.replace(year=month_start.year + 1, month=1)
            else:
                month_end = month_start.replace(month=month_start.month + 1)
            
            # Đơn đã giao
            delivered_count = db.execute(
                select(func.count())
                .select_from(Order)
                .join(OrderStatus)
                .where(
                    and_(
                        OrderStatus.status_name == 'completed',
                        Order.created_at >= month_start,
                        Order.created_at < month_end
                    )
                )
            ).scalar() or 0
            delivered.append(delivered_count)
            
            # Đơn đã hủy
            cancelled_count = db.execute(
                select(func.count())
                .select_from(Order)
                .join(OrderStatus)
                .where(
                    and_(
                        OrderStatus.status_name == 'cancelled',
                        Order.created_at >= month_start,
                        Order.created_at < month_end
                    )
                )
            ).scalar() or 0
            cancelled.append(cancelled_count)
            
            # Doanh thu (chỉ đơn hoàn thành)
            month_revenue = db.execute(
                select(func.coalesce(func.sum(Order.total_amount), 0))
                .select_from(Order)
                .join(OrderStatus)
                .where(
                    and_(
                        OrderStatus.status_name == 'completed',
                        Order.created_at >= month_start,
                        Order.created_at < month_end
                    )
                )
            ).scalar()
            revenue.append(float(month_revenue or 0))
        
        return {
            "months": month_labels,
            "delivered": delivered,
            "cancelled": cancelled,
            "revenue": revenue
        }
    except Exception as e:
        print(f"❌ Error in get_monthly_trends: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Lỗi lấy xu hướng tháng: {str(e)}"
        )