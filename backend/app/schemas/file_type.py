from pydantic import BaseModel, UUID4
from typing import Optional

class FileTypeResponse(BaseModel):
    id: UUID4
    extension: str
    mime_type: str
    description: Optional[str] = None

    class Config:
        from_attributes = True
