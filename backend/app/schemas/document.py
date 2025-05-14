from pydantic import BaseModel, UUID4
from typing import Optional, List
from datetime import datetime
from app.models import DocumentStatus, DocumentAccessLevel

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    publisher_id: Optional[UUID4] = None
    publication_year: Optional[int] = None
    isbn: Optional[str] = None
    category_id: UUID4
    language: str = "en"
    version: str = "1.0"
    access_level: DocumentAccessLevel = DocumentAccessLevel.PUBLIC

class DocumentCreate(DocumentBase):
    file_name: str
    file_type: UUID4
    file_size: int
    file_hash: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publisher_id: Optional[UUID4] = None
    publication_year: Optional[int] = None
    isbn: Optional[str] = None
    category_id: Optional[UUID4] = None
    language: Optional[str] = None
    version: Optional[str] = None
    access_level: Optional[DocumentAccessLevel] = None
    status: Optional[DocumentStatus] = None
    is_featured: Optional[bool] = None

class DocumentResponse(DocumentBase):
    id: UUID4
    file_name: str
    file_type: UUID4
    file_size: int
    file_hash: str
    status: DocumentStatus
    download_count: int
    view_count: int
    is_featured: bool
    ai_summary: Optional[str] = None
    added_by: UUID4
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DocumentList(BaseModel):
    total: int
    skip: int
    limit: int
    documents: List[DocumentResponse] 