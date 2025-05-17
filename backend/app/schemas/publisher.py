from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from ..models.enums import PublisherStatus

class PublisherBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: PublisherStatus = PublisherStatus.ACTIVE

    @validator('phone')
    def validate_phone(cls, v):
        if v is None:
            return v
        # Remove any spaces or special characters
        phone = ''.join(filter(lambda x: x.isdigit() or x == '+', v))
        # Check if it starts with + (optional) and contains only digits
        if not phone.startswith('+'):
            phone = '+' + phone
        if not (8 <= len(phone) <= 20):
            raise ValueError('Phone number must be 8-20 digits, optionally starting with +')
        return phone

class PublisherCreate(PublisherBase):
    pass

class PublisherUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    status: Optional[PublisherStatus] = None

class PublisherInDB(PublisherBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PublisherResponse(PublisherInDB):
    pass
