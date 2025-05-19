from pydantic import BaseModel, UUID4
from datetime import datetime
from typing import Optional
from .document import DocumentResponse

class FavoriteBase(BaseModel):
    document_id: UUID4

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(FavoriteBase):
    id: UUID4
    user_id: UUID4
    document_id: UUID4
    created_at: datetime
    document: Optional[DocumentResponse] = None

    class Config:
        from_attributes = True 