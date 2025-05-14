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
    """Send verification code email"""
    message = MessageSchema(
        subject="Email Verification",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h1>Email Verification</h1>
                <p>Your verification code is: <strong>{code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

async def send_password_reset_email(email: str, code: str):
    """Send password reset code email"""
    message = MessageSchema(
        subject="Password Reset",
        recipients=[email],
        body=f"""
        <html>
            <body>
                <h1>Password Reset Request</h1>
                <p>Your password reset code is: <strong>{code}</strong></p>
                <p>This code will expire in 15 minutes.</p>
                <p>If you did not request a password reset, please ignore this email.</p>
            </body>
        </html>
        """,
        subtype="html"
    )
    
    fm = FastMail(conf)
    await fm.send_message(message)

def send_verification_email_old(email: str, code: str) -> bool:
    """
    Send verification code to user's email
    Returns True if email was sent successfully
    """
    try:
        # Create message
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = email
        msg['Subject'] = "Verify your SenseLib account"

        # Email body
        body = f"""
        <html>
            <body>
                <h2>Welcome to SenseLib!</h2>
                <p>Your verification code is: <strong>{code}</strong></p>
                <p>This code will expire in 10 minutes.</p>
                <p>If you didn't request this code, please ignore this email.</p>
            </body>
        </html>
        """
        msg.attach(MIMEText(body, 'html'))

        # Connect to SMTP server and send email
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.send_message(msg)
        
        return True
    except Exception as e:
        print(f"Error sending email: {str(e)}")
        return False 