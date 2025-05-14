from datetime import datetime, timezone, timedelta
from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models import User
from app.services.email import (
    generate_verification_code,
    send_verification_email,
    get_code_expiration,
    send_password_reset_email
)

class VerificationService:
    @staticmethod
    async def send_verification_code(user: User, db: Session) -> dict:
        """
        Send verification code to user's email
        """
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        
        # Generate new verification code
        code = generate_verification_code()
        user.verification_code = code
        user.verification_code_expires = get_code_expiration()
        
        db.commit()
        
        # Send email
        await send_verification_email(
            email=user.email,
            code=code
        )
        
        return {"message": "Verification code sent to your email"}

    @staticmethod
    async def verify_email(code: str, user: User, db: Session) -> User:
        """
        Verify user's email with verification code
        """
        if user.is_verified:
            raise HTTPException(status_code=400, detail="Email already verified")
        if not user.verification_code:
            raise HTTPException(status_code=400, detail="No verification code found. Please request a new code.")
        if not user.verification_code_expires:
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
        
        # Convert current time to UTC timezone-aware datetime
        current_time = datetime.now(timezone.utc)
        
        # Ensure verification_code_expires is timezone-aware
        if user.verification_code_expires.tzinfo is None:
            user.verification_code_expires = user.verification_code_expires.replace(tzinfo=timezone.utc)
        
        if current_time > user.verification_code_expires:
            user.verification_code = None
            user.verification_code_expires = None
            db.commit()
            raise HTTPException(status_code=400, detail="Verification code has expired. Please request a new code.")
        
        if code != user.verification_code:
            raise HTTPException(status_code=400, detail="Invalid verification code")
        
        user.is_verified = True
        user.verification_code = None
        user.verification_code_expires = None
        user.updated_at = current_time
        db.commit()
        db.refresh(user)
        return user

    @staticmethod
    async def send_password_reset_code(user: User, db: Session) -> dict:
        """
        Send password reset code to user's email
        """
        if not user.is_verified:
            raise HTTPException(status_code=400, detail="Email must be verified before resetting password")
        
        # Generate new reset code
        code = generate_verification_code()
        user.verification_code = code
        user.verification_code_expires = get_code_expiration()
        
        db.commit()
        
        # Send email
        await send_password_reset_email(
            email=user.email,
            code=code
        )
        
        return {"message": "Password reset code sent to your email"}

    @staticmethod
    async def verify_reset_code(code: str, user: User, db: Session) -> bool:
        """
        Verify password reset code
        """
        if not user.verification_code:
            raise HTTPException(status_code=400, detail="No reset code found. Please request a new code.")
        if not user.verification_code_expires:
            raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new code.")
        
        current_time = datetime.now(timezone.utc)
        
        if user.verification_code_expires.tzinfo is None:
            user.verification_code_expires = user.verification_code_expires.replace(tzinfo=timezone.utc)
        
        if current_time > user.verification_code_expires:
            user.verification_code = None
            user.verification_code_expires = None
            db.commit()
            raise HTTPException(status_code=400, detail="Reset code has expired. Please request a new code.")
        
        if code != user.verification_code:
            raise HTTPException(status_code=400, detail="Invalid reset code")
        
        return True 