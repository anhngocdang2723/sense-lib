from fastapi import APIRouter, Depends, HTTPException, Query, Path, BackgroundTasks
from typing import List, Any, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from uuid import UUID
from sqlalchemy import text

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user, create_access_token, get_password_hash, verify_password
from app.models import User, UserRole
from app.schemas.user import UserCreate, UserUpdate, UserResponse, UserList, UserVerification, PasswordReset, PasswordChange
from app.services.email import generate_verification_code, send_verification_email, get_code_expiration
from app.services.verification import VerificationService
from pydantic import BaseModel

router = APIRouter()

class PasswordChange(BaseModel):
    old_password: str
    new_password: str

@router.get("/profile", response_model=UserResponse)
async def get_user_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Get current user's profile information
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    return user

@router.put("/profile", response_model=UserResponse)
async def update_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # First try to remove all phone-related constraints
        db.execute(text("""
            DO $$
            DECLARE
                r RECORD;
            BEGIN
                FOR r IN (SELECT conname FROM pg_constraint WHERE conrelid = 'users'::regclass AND conname LIKE '%phone%')
                LOOP
                    EXECUTE 'ALTER TABLE users DROP CONSTRAINT IF EXISTS ' || quote_ident(r.conname);
                END LOOP;
            END $$;
        """))
        db.commit()
        
        # Then update the user
        for field, value in user_update.dict(exclude_unset=True).items():
            setattr(current_user, field, value)
        
        db.commit()
        db.refresh(current_user)
        return current_user
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/list", response_model=UserList)
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    role: Optional[UserRole] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserList:
    """
    List users with filtering and pagination (admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to list users"
        )
    
    query = db.query(User)
    
    # Apply filters
    if role:
        query = query.filter(User.role == role)
    if search:
        query = query.filter(
            (User.email.ilike(f"%{search}%")) |
            (User.username.ilike(f"%{search}%")) |
            (User.full_name.ilike(f"%{search}%"))
        )
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    users = query.offset(skip).limit(limit).all()
    
    return UserList(
        total=total,
        skip=skip,
        limit=limit,
        users=users
    )

@router.put("/{user_id}/role", response_model=UserResponse)
async def update_user_role(
    user_id: UUID = Path(...),
    new_role: UserRole = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Update user role (admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update user roles"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user.role = new_role
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@router.put("/{user_id}/status", response_model=UserResponse)
async def update_user_status(
    user_id: UUID = Path(...),
    is_active: bool = Query(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Update user status (admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to update user status"
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    user.is_active = is_active
    user.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user

@router.post("/send-verification")
async def send_verification_code(
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Send verification code to user's email
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await VerificationService.send_verification_code(user, db)

@router.post("/verify-email", response_model=UserResponse)
async def verify_email(
    code: str = Query(..., min_length=6, max_length=6, description="6-digit verification code"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> UserResponse:
    """
    Verify user's email with verification code
    """
    user = db.query(User).filter(User.id == current_user.id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await VerificationService.verify_email(code, user, db)

@router.post("/forgot-password")
async def forgot_password(
    email: str = Query(..., description="User's email address"),
    db: Session = Depends(get_db)
) -> dict:
    """
    Request password reset code
    """
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return await VerificationService.send_password_reset_code(user, db)

@router.post("/reset-password")
async def reset_password(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
) -> dict:
    """
    Reset password using verification code
    """
    user = db.query(User).filter(User.email == reset_data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Verify reset code
    await VerificationService.verify_reset_code(reset_data.code, user, db)
    
    # Update password
    user.hashed_password = get_password_hash(reset_data.new_password)
    user.verification_code = None
    user.verification_code_expires = None
    user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Password has been reset successfully"}

@router.post("/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Change user's password by providing old and new password
    """
    # Verify old password
    if not verify_password(password_data.old_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect old password"
        )
    
    # Update to new password
    current_user.hashed_password = get_password_hash(password_data.new_password)
    current_user.updated_at = datetime.now(timezone.utc)
    
    db.commit()
    
    return {"message": "Password has been changed successfully"} 