from pydantic import BaseModel, UUID4, Field
from datetime import datetime
from typing import Optional
from .user import UserResponse

class RatingBase(BaseModel):
    rating: int = Field(ge=1, le=5)  # Rating must be between 1 and 5
    comment: Optional[str] = None

class RatingCreate(RatingBase):
    document_id: UUID4

class RatingResponse(RatingBase):
    id: UUID4
    document_id: UUID4
    user_id: UUID4
    user: UserResponse
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True 