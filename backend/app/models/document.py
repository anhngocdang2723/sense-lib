from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import DocumentStatus, DocumentAccessLevel

class Document(BaseModel):
    __tablename__ = "documents"

    title = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    publisher_id = Column(UUID(as_uuid=True), ForeignKey("publishers.id"), nullable=True)
    publication_year = Column(Integer, nullable=True)
    isbn = Column(String, unique=True, nullable=True)
    file_name = Column(String, nullable=False, index=True)
    file_hash = Column(String, unique=True, index=True)
    file_type = Column(UUID(as_uuid=True), ForeignKey("file_types.id"), nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(SQLEnum(DocumentStatus), default=DocumentStatus.PENDING)
    category_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False)
    access_level = Column(SQLEnum(DocumentAccessLevel), default=DocumentAccessLevel.PUBLIC)
    language = Column(String, ForeignKey("languages.code"), default="en")
    version = Column(String, default="1.0")
    download_count = Column(Integer, default=0)
    view_count = Column(Integer, default=0)
    is_featured = Column(Boolean, default=False)
    ai_summary = Column(Text, nullable=True)
    added_by = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    image_url = Column(String, nullable=True)

    # Relationships
    added_by_user = relationship("User", foreign_keys=[added_by], back_populates="documents")
    publisher = relationship("Publisher", back_populates="documents")
    category = relationship("Category", back_populates="documents")
    file_type_rel = relationship("FileType", back_populates="documents")
    language_rel = relationship("Language", back_populates="documents")
    authors = relationship(
        "Author",
        secondary="document_author",
        back_populates="documents",
        primaryjoin="Document.id == DocumentAuthor.document_id",
        secondaryjoin="Author.id == DocumentAuthor.author_id"
    )
    tags = relationship("Tag", secondary="document_tag", back_populates="documents")
    chapters = relationship("DocumentChapter", back_populates="document", cascade="all, delete-orphan")
    sections = relationship("DocumentSection", back_populates="document", cascade="all, delete-orphan")
    audio_files = relationship("DocumentAudio", back_populates="document", cascade="all, delete-orphan")
    qa_pairs = relationship("DocumentQA", back_populates="document", cascade="all, delete-orphan")
    access_records = relationship("DocumentAccess", back_populates="document", cascade="all, delete-orphan")
    comments = relationship("Comment", back_populates="document", cascade="all, delete-orphan")
    ratings = relationship("Rating", back_populates="document", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="document", cascade="all, delete-orphan")
    access_logs = relationship("AccessLogs", back_populates="document", cascade="all, delete-orphan")
    reading_progress = relationship("ReadingProgress", back_populates="document", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint('file_size > 0', name='check_file_size'),
        CheckConstraint("publication_year >= 1800 AND publication_year <= EXTRACT(YEAR FROM CURRENT_DATE)", name='check_publication_year'),
        CheckConstraint("isbn IS NULL OR (isbn ~ '^(?:[0-9]{10}|[0-9]{13}|[0-9]{3}-[0-9]{1,5}-[0-9]{1,7}-[0-9]{1,6}-[0-9])$')", name='check_isbn'),
        CheckConstraint("version ~ '^[0-9]+\\.[0-9]+(\\.[0-9]+)?$'", name='check_version_format'),
    ) 