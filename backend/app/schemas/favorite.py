from pydantic import BaseModel, UUID4
from datetime import datetime

class FavoriteBase(BaseModel):
    document_id: UUID4

class FavoriteCreate(FavoriteBase):
    pass

class FavoriteResponse(FavoriteBase):
    id: UUID4
    user_id: UUID4
    created_at: datetime

    class Config:
        from_attributes = True 