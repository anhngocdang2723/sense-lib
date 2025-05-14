from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import DocumentAudioStatus

class DocumentAudio(BaseModel):
    __tablename__ = "document_audio"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("document_chapters.id"), nullable=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("document_sections.id"), nullable=True)
    language = Column(String, ForeignKey("languages.code"), nullable=False)
    voice_id = Column(String, ForeignKey("voices.id"), nullable=False)
    file_url = Column(String, nullable=False)
    duration_seconds = Column(Integer, nullable=False)
    file_size = Column(Integer, nullable=False)
    status = Column(SQLEnum(DocumentAudioStatus), default=DocumentAudioStatus.PENDING)

    # Relationships
    document = relationship("Document", back_populates="audio_files")
    chapter = relationship("DocumentChapter", back_populates="audio_files")
    section = relationship("DocumentSection", back_populates="audio_files")
    language_rel = relationship("Language", back_populates="audio_files")
    voice = relationship("Voice", back_populates="audio_files")

    __table_args__ = (
        CheckConstraint('duration_seconds > 0', name='check_audio_duration'),
        CheckConstraint('file_size > 0', name='check_audio_size'),
        CheckConstraint('chapter_id IS NOT NULL OR section_id IS NOT NULL', name='check_audio_context'),
        Index('idx_document_audio_document', 'document_id'),
        Index('idx_document_audio_chapter', 'chapter_id'),
        Index('idx_document_audio_section', 'section_id'),
        Index('idx_document_audio_language', 'language'),
        Index('idx_document_audio_doc_chapter_section', 'document_id', 'chapter_id', 'section_id'),
    ) 