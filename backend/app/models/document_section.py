from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, CheckConstraint, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class DocumentSection(BaseModel):
    __tablename__ = "document_sections"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("document_chapters.id"), nullable=True)
    title = Column(String, nullable=False)
    section_number = Column(Integer, nullable=False)
    start_position = Column(Float, nullable=True)
    end_position = Column(Float, nullable=True)

    # Relationships
    document = relationship("Document", back_populates="sections")
    chapter = relationship("DocumentChapter", back_populates="sections")
    audio_files = relationship("DocumentAudio", back_populates="section", cascade="all, delete-orphan")
    qa_pairs = relationship("DocumentQA", back_populates="section", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('document_id', 'chapter_id', 'section_number', name='uq_document_section_number'),
        CheckConstraint('section_number > 0', name='check_section_number'),
        CheckConstraint('start_position IS NULL OR end_position IS NULL OR start_position < end_position', name='check_section_positions'),
        Index('idx_document_sections_document', 'document_id'),
        Index('idx_document_sections_chapter', 'chapter_id'),
    ) 