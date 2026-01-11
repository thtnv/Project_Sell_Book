import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict
from app.core.config import settings

logger = logging.getLogger(__name__)

def send_order_confirmation_email(
    user_email: str, 
    user_name: str,
    order_id: str,
    order_data: Dict
) -> bool:
    """
    Gửi email xác nhận đơn hàng sử dụng cấu hình từ settings
    """
    smtp_server = settings.MAIL_SERVER
    smtp_port = settings.MAIL_PORT
    sender_email = settings.MAIL_USERNAME
    password = settings.MAIL_PASSWORD 
    
    try:
        # Chuẩn bị dữ liệu hiển thị
        items_html = ""
        for item in order_data.get("items", []):
            items_html += f"""
            <tr>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: left;">{item.get('title', 'N/A')}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: center;">{item.get('quantity', 0)}</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right;">{item.get('price', 0):,} đ</td>
                <td style="padding: 12px; border: 1px solid #e0e0e0; text-align: right; font-weight: bold;">
                    {(item.get('quantity', 0) * item.get('price', 0)):,} đ
                </td>
            </tr>
            """
        
        payment_methods = {'PM001': '💵 Tiền mặt (COD)', 'PM002': '💳 Chuyển khoản ngân hàng'}
        payment_text = payment_methods.get(order_data.get('payment_method_id'), 'Không xác định')
        
        # Lấy các giá trị tiền tệ đã tính toán từ service
        shipping_fee = 30000
        total_amount = order_data.get('total_amount', 0)
        subtotal = order_data.get('subtotal', total_amount - shipping_fee)

        html_content = f"""
        <!DOCTYPE html>
        <html>
        <body style="font-family: sans-serif; color: #333;">
            <div style="background: #0F9D58; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
                <h1>🎉 Đặt Hàng Thành Công!</h1>
            </div>
            <div style="padding: 20px; border: 1px solid #e0e0e0;">
                <p>Xin chào <strong>{user_name}</strong>,</p>
                <p>Cảm ơn bạn đã đặt hàng tại <strong>Nhà Sách UTE</strong>.</p>
                <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Mã đơn hàng:</strong> {order_id}</p>
                    <p><strong>Địa chỉ:</strong> {order_data.get('shipping_address')}</p>
                    <p><strong>Thanh toán:</strong> {payment_text}</p>
                </div>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background: #f2fbf7;">
                            <th style="padding: 10px; border: 1px solid #ddd;">Sản phẩm</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">SL</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Đơn giá</th>
                            <th style="padding: 10px; border: 1px solid #ddd;">Tổng</th>
                        </tr>
                    </thead>
                    <tbody>{items_html}</tbody>
                </table>
                <div style="margin-top: 20px; text-align: right; background: #f9fafb; padding: 15px;">
                    <p>Tạm tính: <strong>{int(subtotal):,} đ</strong></p>
                    <p>Phí vận chuyển: <strong>{shipping_fee:,} đ</strong></p>
                    <p style="font-size: 1.2em; color: #0F9D58;">Tổng cộng: <strong>{int(total_amount):,} đ</strong></p>
                </div>
            </div>
        </body>
        </html>
        """

        message = MIMEMultipart("alternative")
        message["From"] = f"Nhà Sách UTE <{settings.MAIL_FROM}>"
        message["To"] = user_email
        message["Subject"] = f"✅ Xác nhận đơn hàng #{order_id}"
        message.attach(MIMEText(html_content, "html", "utf-8"))

        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, password)
        server.sendmail(sender_email, user_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        logger.error(f"Lỗi gửi mail: {str(e)}")
        return False

def send_order_status_update_email(user_email: str, user_name: str, order_id: str, old_status: str, new_status: str) -> bool:
    """Gửi email thông báo trạng thái đơn hàng thay đổi"""
    try:
        status_map = {
            'processing': '⏳ Đang xử lý', 'confirmed': '✅ Đã xác nhận',
            'shipping': '🚚 Đang giao hàng', 'completed': '🎉 Hoàn thành', 'cancelled': '❌ Đã hủy'
        }
        
        html = f"<h2>Cập nhật đơn hàng #{order_id}</h2><p>Chào {user_name}, trạng thái mới: <b>{status_map.get(new_status, new_status)}</b></p>"
        
        msg = MIMEMultipart(); msg["From"] = settings.MAIL_FROM; msg["To"] = user_email
        msg["Subject"] = f"Cập nhật trạng thái đơn hàng #{order_id}"
        msg.attach(MIMEText(html, "html"))
        
        server = smtplib.SMTP(settings.MAIL_SERVER, settings.MAIL_PORT)
        server.starttls(); server.login(settings.MAIL_USERNAME, settings.MAIL_PASSWORD)
        server.sendmail(settings.MAIL_FROM, user_email, msg.as_string()); server.quit()
        return True
    except Exception as e:
        logger.error(f"Lỗi gửi mail trạng thái: {e}"); return False