from pydantic import BaseModel, UUID4
from typing import Optional

class PublisherResponse(BaseModel):
    id: UUID4
    name: str
    description: Optional[str] = None
    website: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

    class Config:
        from_attributes = True
