from sqlalchemy import Column, String, Integer, Float, Text, DateTime, ForeignKey, CheckConstraint, UniqueConstraint, Index
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class DocumentChapter(BaseModel):
    __tablename__ = "document_chapters"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    title = Column(String, nullable=False)
    chapter_number = Column(Integer, nullable=False)
    start_position = Column(Float, nullable=True, comment="Starting position (e.g., percentage or page)")
    end_position = Column(Float, nullable=True, comment="Ending position")
    ai_summary = Column(Text, nullable=True, comment="AI-generated chapter summary")

    # Relationships
    document = relationship("Document", back_populates="chapters")
    sections = relationship("DocumentSection", back_populates="chapter", cascade="all, delete-orphan")
    audio_files = relationship("DocumentAudio", back_populates="chapter", cascade="all, delete-orphan")
    qa_pairs = relationship("DocumentQA", back_populates="chapter", cascade="all, delete-orphan")

    __table_args__ = (
        UniqueConstraint('document_id', 'chapter_number', name='uq_document_chapter_number'),
        CheckConstraint('chapter_number > 0', name='check_chapter_number'),
        CheckConstraint('start_position IS NULL OR end_position IS NULL OR start_position < end_position', name='check_chapter_positions'),
        Index('idx_document_chapters_document', 'document_id'),
        Index('idx_document_chapters_number', 'document_id', 'chapter_number'),
    ) 