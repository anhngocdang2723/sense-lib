from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime

class LanguageBase(BaseModel):
    code: str = Field(..., pattern="^[a-z]{2}$")
    name: str = Field(..., min_length=2)
    native_name: Optional[str] = None
    is_active: bool = True

class LanguageCreate(LanguageBase):
    pass

class LanguageUpdate(BaseModel):
    name: Optional[str] = None
    native_name: Optional[str] = None
    is_active: Optional[bool] = None

class LanguageInDB(LanguageBase):
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class LanguageResponse(LanguageInDB):
    pass 