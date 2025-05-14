from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from uuid import UUID
from datetime import datetime, date
from ..models.enums import AuthorStatus

class AuthorBase(BaseModel):
    name: str = Field(..., min_length=2)
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    nationality: Optional[str] = None
    status: AuthorStatus = AuthorStatus.ACTIVE

    @validator('death_date')
    def validate_dates(cls, v, values):
        if v and 'birth_date' in values and values['birth_date']:
            if v < values['birth_date']:
                raise ValueError('Death date must be after birth date')
        return v

class AuthorCreate(AuthorBase):
    slug: Optional[str] = None

class AuthorUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    bio: Optional[str] = None
    email: Optional[EmailStr] = None
    website: Optional[str] = None
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    nationality: Optional[str] = None
    status: Optional[AuthorStatus] = None
    slug: Optional[str] = None

class AuthorInDB(AuthorBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class AuthorResponse(AuthorInDB):
    pass 