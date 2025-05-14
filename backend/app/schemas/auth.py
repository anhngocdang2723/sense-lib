from pydantic import BaseModel, EmailStr
from typing import Optional
from app.models import UserRole
from .user import UserResponse  # Import UserResponse from user.py

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse  # Use the imported UserResponse

class TokenData(BaseModel):
    username: Optional[str] = None

class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: str

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    role: UserRole
    is_verified: bool = False

    class Config:
        from_attributes = True  # For SQLAlchemy model compatibility 