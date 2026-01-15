# backend/app/routers/payment.py
from fastapi import APIRouter, Request, Header, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import select
import stripe
import os
import logging
from app.core.database import get_db
from app.services.email import send_order_confirmation_email
from app.models.order import Order
from app.models.order_detail import OrderDetail

router = APIRouter(prefix="/payment", tags=["Payment"])
logger = logging.getLogger(__name__)


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: str = Header(None),
    db: Session = Depends(get_db),
):
    payload = await request.body()
    sig_header = stripe_signature
    endpoint_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, endpoint_secret)
    except ValueError as e:
        logger.error(f"Invalid payload: {e}")
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError as e:
        logger.error(f"Invalid signature: {e}")
        raise HTTPException(status_code=400, detail="Invalid signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        order_id = session.get("metadata", {}).get("order_id")

        if order_id:
            logger.info(f"💰 Webhook received for Order: {order_id}")

            try:
                # 1. Tìm đơn hàng
                stmt = (
                    select(Order)
                    .options(
                        joinedload(Order.user),
                        joinedload(Order.order_details).joinedload(OrderDetail.book),
                    )
                    .where(Order.order_id == order_id)
                )
                order = db.execute(stmt).unique().scalar_one_or_none()

                if not order:
                    logger.error(f"Order {order_id} not found!")
                    return {"status": "error", "detail": "Order not found"}

                # [ĐÃ XÓA]: Đoạn cập nhật order.payment_status gây lỗi
                # Vì bạn không muốn dùng cột này, chúng ta bỏ qua bước update DB.
                # Đơn hàng vẫn giữ nguyên trạng thái ban đầu (processing) từ lúc tạo.

                # 2. Chuẩn bị dữ liệu gửi mail
                email_items = []
                for d in order.order_details:
                    title = d.book.title if d.book else "Sách đã bị xóa"
                    email_items.append(
                        {
                            "title": title,
                            "quantity": d.quantity,
                            "price": float(d.unit_price),
                        }
                    )

                email_payload = {
                    "items": email_items,
                    "subtotal": float(order.total_amount) - 30000,  # Giả sử ship 30k
                    "total_amount": float(order.total_amount),
                    "shipping_address": order.shipping_address,
                    "payment_method_id": order.payment_method_id,
                }

                # 3. Gửi Email
                if order.user and order.user.email:
                    logger.info(f"📧 Sending email to {order.user.email}...")
                    send_result = send_order_confirmation_email(
                        order.user.email, order.user.full_name, order_id, email_payload
                    )

                    if send_result:
                        logger.info("✅ Email sent successfully.")
                    else:
                        logger.error("❌ Failed to send email.")
                else:
                    logger.warning("⚠️ User email not found.")

            except Exception as e:
                logger.error(f"❌ Error logic webhook: {str(e)}")
                return {"status": "error", "detail": str(e)}

    return {"status": "success"}
