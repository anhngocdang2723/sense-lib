from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime
from ..models.enums import TagStatus

class TagBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    status: TagStatus = TagStatus.ACTIVE

class TagCreate(TagBase):
    slug: Optional[str] = None

class TagUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TagStatus] = None
    slug: Optional[str] = None

class TagInDB(TagBase):
    id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TagResponse(TagInDB):
    pass 