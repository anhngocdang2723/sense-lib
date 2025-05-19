from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional, List
from .user import UserResponse
from app.models.enums import CommentStatus

class CommentBase(BaseModel):
    content: str

class CommentCreate(CommentBase):
    document_id: UUID4
    parent_id: Optional[UUID4] = None

class CommentStatusUpdate(BaseModel):
    status: CommentStatus

class CommentResponse(CommentBase):
    id: UUID4
    document_id: UUID4
    user_id: UUID4
    parent_id: Optional[UUID4] = None
    created_at: datetime
    updated_at: datetime
    is_edited: bool
    status: CommentStatus
    user: UserResponse
    replies: Optional[List['CommentResponse']] = []

    class Config:
        from_attributes = True 