from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from typing import Optional

from app.core.config import settings
from app.core.database import get_db
from app.models import User, UserRole  # Import directly from app.models
from app.schemas.auth import Token, TokenData, UserCreate
from app.schemas.user import UserResponse  # Import UserResponse from user.py
from app.core.security import (
    verify_password,
    get_password_hash,
    create_access_token,
    get_current_user
)

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Optional[Token]:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Update last login time using direct SQL to avoid triggering updated_at
    db.execute(
        text("UPDATE users SET last_login = :now WHERE id = :user_id"),
        {"now": datetime.utcnow(), "user_id": user.id}
    )
    db.commit()
    
    # Refresh user object to get updated last_login
    db.refresh(user)
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=user  # Pass the entire user object, Pydantic will handle the conversion
    )

@router.post("/register")
async def register(
    email: str,
    password: str,
    username: str,
    full_name: str,
    db: Session = Depends(get_db)
) -> Optional[UserResponse]:
    """
    Register a new user
    """
    # Check if user already exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    if db.query(User).filter(User.username == username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already taken"
        )
    
    # Create new user with all required fields
    hashed_password = get_password_hash(password)
    now = datetime.utcnow()
    user = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        full_name=full_name,
        role=UserRole.MEMBER,
        is_active=True,
        is_verified=False,
        failed_login_attempts=0,
        lockout_until=None,
        created_at=now  # Only set created_at, updated_at will be handled by database
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    
    return user  # Pass the entire user object, Pydantic will handle the conversion
    
@router.post("/create-admin")
async def create_admin_user(
    email: str = "admin@example.com",
    password: str = "admin123",
    username: str = "admin",
    full_name: str = "System Admin",
    phone_number: str = None,
    address: str = None,
    avatar_url: str = None,
    db: Session = Depends(get_db)
) -> Optional[Token]:
    """
    Create an admin user for testing (only available in debug mode)
    """
    if not settings.DEBUG:
        raise HTTPException(
            status_code=403,
            detail="This endpoint is only available in debug mode"
        )
    
    # Check if admin already exists
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(
            status_code=400,
            detail="Admin user already exists"
        )
    
    # Create admin user with all necessary fields
    hashed_password = get_password_hash(password)
    admin = User(
        email=email,
        username=username,
        hashed_password=hashed_password,
        full_name=full_name,
        role=UserRole.ADMIN,
        is_active=True,
        is_verified=True,
        failed_login_attempts=0,
        lockout_until=None,
        phone_number=phone_number,
        address=address,
        avatar_url=avatar_url,
        last_login=datetime.now(),
        verification_code=None,
        verification_code_expires=None
    )
    
    db.add(admin)
    db.commit()
    db.refresh(admin)
    
    # Create access token for admin
    access_token = create_access_token(
        data={"sub": admin.username}
    )
    return Token(
        access_token=access_token,
        token_type="bearer",
        user=UserResponse(
            id=admin.id,
            email=admin.email,
            username=admin.username,
            role=admin.role
        )
    )