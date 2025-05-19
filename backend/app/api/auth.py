from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import text
from datetime import datetime, timedelta
from typing import Optional
import time
from functools import lru_cache

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

router = APIRouter()

# Rate limiting for token refresh
REFRESH_COOLDOWN = 60  # seconds between refresh attempts
MAX_REFRESH_ATTEMPTS = 3  # maximum attempts per minute
LOCKOUT_DURATION = 300  # 5 minutes lockout after exceeding attempts
refresh_attempts = {}

def check_refresh_rate_limit(user_id: str) -> bool:
    """Check if user has exceeded refresh rate limits"""
    current_time = time.time()
    
    # Initialize or get user's refresh attempts
    if user_id not in refresh_attempts:
        refresh_attempts[user_id] = {
            'attempts': [],
            'last_refresh': 0,
            'lockout_until': 0
        }
    
    user_attempts = refresh_attempts[user_id]
    
    # Check if user is in lockout
    if user_attempts['lockout_until'] > current_time:
        remaining = int(user_attempts['lockout_until'] - current_time)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Account locked for {remaining} seconds due to too many attempts"
        )
    
    # Remove attempts older than 1 minute
    user_attempts['attempts'] = [
        t for t in user_attempts['attempts'] 
        if current_time - t < 60
    ]
    
    # Check cooldown period
    if current_time - user_attempts['last_refresh'] < REFRESH_COOLDOWN:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Please wait {REFRESH_COOLDOWN} seconds between refresh attempts"
        )
    
    # Check maximum attempts
    if len(user_attempts['attempts']) >= MAX_REFRESH_ATTEMPTS:
        user_attempts['lockout_until'] = current_time + LOCKOUT_DURATION
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many attempts. Account locked for {LOCKOUT_DURATION/60} minutes"
        )
    
    # Update attempts
    user_attempts['attempts'].append(current_time)
    user_attempts['last_refresh'] = current_time
    
    return True

@router.post("/login")
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Optional[Token]:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    try:
        user = db.query(User).filter(User.email == form_data.username).first()
        
        # Check if user exists and password is correct
        if not user or not verify_password(form_data.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is active
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User account is inactive",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Check if user is locked out
        if user.lockout_until and user.lockout_until > datetime.utcnow():
            remaining = int((user.lockout_until - datetime.utcnow()).total_seconds())
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Account is locked. Try again in {remaining} seconds",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # Reset failed login attempts on successful login
        user.failed_login_attempts = 0
        user.lockout_until = None
        
        # Update last login time using direct SQL to avoid triggering updated_at
        now = datetime.utcnow()
        db.execute(
            text("UPDATE users SET last_login = :now, failed_login_attempts = 0, lockout_until = NULL WHERE id = :user_id"),
            {"now": now, "user_id": user.id}
        )
        db.commit()
        
        # Create access token with proper expiration
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "role": user.role.value  # Include role in token
            },
            expires_delta=access_token_expires,
            secret_key=settings.JWT_SECRET_KEY
        )
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while processing your request"
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
    
# @router.post("/create-admin")
# async def create_admin_user(
#     email: str = "admin@example.com",
#     password: str = "admin123",
#     username: str = "admin",
#     full_name: str = "System Admin",
#     phone_number: str = None,
#     address: str = None,
#     avatar_url: str = None,
#     db: Session = Depends(get_db)
# ) -> Optional[Token]:
#     """
#     Create an admin user for testing (only available in debug mode)
#     """
#     if not settings.DEBUG:
#         raise HTTPException(
#             status_code=403,
#             detail="This endpoint is only available in debug mode"
#         )
    
#     # Check if admin already exists
#     if db.query(User).filter(User.email == email).first():
#         raise HTTPException(
#             status_code=400,
#             detail="Admin user already exists"
#         )
    
#     # Create admin user with all necessary fields
#     hashed_password = get_password_hash(password)
#     now = datetime.utcnow()
#     admin = User(
#         email=email,
#         username=username,
#         hashed_password=hashed_password,
#         full_name=full_name,
#         role=UserRole.ADMIN,
#         is_active=True,
#         is_verified=True,
#         failed_login_attempts=0,
#         lockout_until=None,
#         phone_number=phone_number,
#         address=address,
#         avatar_url=avatar_url,
#         last_login=now,
#         verification_code=None,
#         verification_code_expires=None,
#         created_at=now
#     )
    
#     db.add(admin)
#     db.commit()
#     db.refresh(admin)
    
#     # Create access token for admin with proper expiration
#     access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
#     access_token = create_access_token(
#         data={"sub": str(admin.id)},
#         expires_delta=access_token_expires,
#         secret_key=settings.JWT_SECRET_KEY
#     )
    
#     return Token(
#         access_token=access_token,
#         token_type="bearer",
#         user=admin
#     )

@router.post("/refresh")
async def refresh_token(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Token:
    """
    Refresh access token
    """
    try:
        # Verify user is still active
        user = db.query(User).filter(User.id == current_user.id).first()
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User is inactive or does not exist"
            )
        
        # Create new access token
        access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        access_token = create_access_token(
            data={
                "sub": str(user.id),
                "role": user.role.value
            },
            expires_delta=access_token_expires,
            secret_key=settings.JWT_SECRET_KEY
        )
        
        # Update last activity
        user.last_login = datetime.utcnow()
        db.commit()
        
        return Token(
            access_token=access_token,
            token_type="bearer",
            user=user
        )
        
    except Exception as e:
        print(f"Refresh token error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not refresh token"
        )