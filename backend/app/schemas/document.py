from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import datetime
from app.models import DocumentStatus, DocumentAccessLevel

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    publisher_id: Optional[UUID4] = None
    publication_year: Optional[int] = Field(None, ge=1800, le=datetime.now().year)
    isbn: Optional[str] = Field(None, pattern=r'^(?:[0-9]{10}|[0-9]{13}|[0-9]{3}-[0-9]{1,5}-[0-9]{1,7}-[0-9]{1,6}-[0-9])$')
    category_id: UUID4
    language: str = "en"
    version: str = Field("1.0", pattern=r'^[0-9]+\.[0-9]+(\.[0-9]+)?$')
    access_level: DocumentAccessLevel = DocumentAccessLevel.PUBLIC

class DocumentCreate(DocumentBase):
    pass

class DocumentCreateResponse(DocumentBase):
    file_name: str
    file_type: UUID4
    file_size: int = Field(gt=0)
    file_hash: str

class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    publisher_id: Optional[UUID4] = None
    publication_year: Optional[int] = Field(None, ge=1800, le=datetime.now().year)
    isbn: Optional[str] = Field(None, pattern=r'^[0-9-]{10,13}$')
    category_id: Optional[UUID4] = None
    language: Optional[str] = None
    version: Optional[str] = Field(None, pattern=r'^[0-9]+\.[0-9]+(\.[0-9]+)?$')
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
    download_count: int = 0
    view_count: int = 0
    is_featured: bool = False
    ai_summary: Optional[str] = None
    added_by: UUID4
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat(),
            UUID4: str
        }

class DocumentList(BaseModel):
    total: int
    skip: int
    limit: int
    documents: List[DocumentResponse]

# Additional schemas for related entities
class DocumentChapterBase(BaseModel):
    title: str
    chapter_number: int = Field(gt=0)
    start_position: Optional[float] = None
    end_position: Optional[float] = None
    ai_summary: Optional[str] = None

class DocumentSectionBase(BaseModel):
    title: str
    section_number: int = Field(gt=0)
    start_position: Optional[float] = None
    end_position: Optional[float] = None

class DocumentAudioBase(BaseModel):
    language: str
    voice_id: str
    file_url: str
    duration_seconds: int = Field(gt=0)
    file_size: int = Field(gt=0)

class DocumentQABase(BaseModel):
    question: str
    answer: str
    context: Optional[str] = None
    language: str 