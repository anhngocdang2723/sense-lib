import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from ..core.config import settings
import random
import string
from datetime import datetime, timedelta, timezone
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True
)

def generate_verification_code() -> str:
    """Generate a 6-digit verification code"""
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

def get_code_expiration() -> datetime:
    """Get expiration time for verification code (15 minutes from now)"""
    return datetime.now(timezone.utc) + timedelta(minutes=15)

async def send_verification_email(email: str, code: str):
    """Gửi email xác minh"""
    message = MessageSchema(
        subject="Xác minh địa chỉ email",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h1>Xác minh email</h1>
                <p>Mã xác minh của bạn là: <strong>{code}</strong></p>
                <p>Mã này sẽ hết hạn sau 15 phút.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_password_reset_email(email: str, code: str):
    """Gửi email đặt lại mật khẩu"""
    message = MessageSchema(
        subject="Yêu cầu đặt lại mật khẩu",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h1>Đặt lại mật khẩu</h1>
                <p>Mã đặt lại mật khẩu của bạn là: <strong>{code}</strong></p>
                <p>Mã này sẽ hết hạn sau 15 phút.</p>
                <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

def send_verification_email_old(email: str, code: str) -> bool:
    """
    Gửi mã xác minh đến email người dùng
    Trả về True nếu gửi thành công
    """
    try:
        # Tạo nội dung email
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Xác minh tài khoản SenseLib"

        # Nội dung HTML của email
        body = f"""
        <html>
            <body>
                <h2>Chào mừng bạn đến với SenseLib!</h2>
                <p>Mã xác minh của bạn là: <strong>{code}</strong></p>
                <p>Mã này sẽ hết hạn sau 10 phút.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email.</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Kết nối và gửi email qua SMTP
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Lỗi khi gửi email: {str(e)}")
        return False
