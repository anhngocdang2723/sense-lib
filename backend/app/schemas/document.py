from pydantic import BaseModel, UUID4, Field
from typing import Optional, List
from datetime import datetime
from app.models import DocumentStatus, DocumentAccessLevel
from app.schemas.category import CategoryFlat
from app.schemas.publisher import PublisherResponse
from app.schemas.file_type import FileTypeResponse
from app.schemas.language import LanguageResponse
from app.schemas.user import UserResponse
from app.schemas.author import AuthorResponse
from app.schemas.tag import TagResponse

class DocumentBase(BaseModel):
    title: str
    description: Optional[str] = None
    publisher_id: Optional[UUID4] = None
    publication_year: Optional[int] = Field(None, ge=1800, le=datetime.now().year)
    isbn: Optional[str] = Field(None, pattern=r'^[0-9-]{10,20}$')
    category_id: UUID4
    language: str = "en"
    version: str = Field("1.0", pattern=r'^[0-9]+\.[0-9]+(\.[0-9]+)?$')
    access_level: DocumentAccessLevel = DocumentAccessLevel.PUBLIC
    image_url: Optional[str] = None
    author_ids: Optional[List[UUID4]] = None
    tag_ids: Optional[List[UUID4]] = None

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
    isbn: Optional[str] = Field(None, pattern=r'^[0-9-]{10,20}$')
    category_id: Optional[UUID4] = None
    language: Optional[str] = None
    version: Optional[str] = Field(None, pattern=r'^[0-9]+\.[0-9]+(\.[0-9]+)?$')
    access_level: Optional[DocumentAccessLevel] = None
    status: Optional[DocumentStatus] = None
    is_featured: Optional[bool] = None
    image_url: Optional[str] = None
    author_ids: Optional[List[UUID4]] = None
    tag_ids: Optional[List[UUID4]] = None

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
    category: Optional[CategoryFlat] = None
    publisher: Optional[PublisherResponse] = None
    file_type_rel: Optional[FileTypeResponse] = None
    language_rel: Optional[LanguageResponse] = None
    added_by_user: Optional[UserResponse] = None
    image_url: Optional[str] = None
    authors: Optional[List[AuthorResponse]] = []
    tags: Optional[List[TagResponse]] = []

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