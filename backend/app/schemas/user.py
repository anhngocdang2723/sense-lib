from pydantic import BaseModel, EmailStr, UUID4, Field, validator
from typing import Optional
from datetime import datetime
from app.models import UserRole
import re
from uuid import UUID

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    address: Optional[str] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=6)

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = Field(None, min_length=3, max_length=50)
    full_name: Optional[str] = None
    phone_number: Optional[str] = Field(None, min_length=8, max_length=15)
    address: Optional[str] = None
    avatar_url: Optional[str] = None
    password: Optional[str] = Field(None, min_length=6)

    @validator('phone_number')
    def validate_phone_number(cls, v):
        if v is None:
            return v
        # Remove any spaces or special characters
        phone = re.sub(r'[^0-9+]', '', v)
        # Check if it starts with + (optional) and contains only digits
        if not re.match(r'^\+?[0-9]{8,15}$', phone):
            raise ValueError('Phone number must be 8-15 digits, optionally starting with +')
        return phone

class UserResponse(UserBase):
    id: UUID4
    role: UserRole
    is_active: bool
    is_verified: bool
    avatar_url: Optional[str] = None
    last_login: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class UserList(BaseModel):
    total: int
    skip: int
    limit: int
    users: list[UserResponse]

class UserVerification(BaseModel):
    code: str = Field(..., min_length=6, max_length=6, description="6-digit verification code")
    
    class Config:
        json_schema_extra = {
            "example": {
                "code": "123456"
            }
        }

class PasswordReset(BaseModel):
    email: EmailStr
    code: str = Field(..., min_length=6, max_length=6)
    new_password: str = Field(..., min_length=6)

class PasswordChange(BaseModel):
    old_password: str = Field(..., min_length=6)
    new_password: str = Field(..., min_length=6) 