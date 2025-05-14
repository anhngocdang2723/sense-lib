from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class DocumentQA(BaseModel):
    __tablename__ = "document_qa"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("document_chapters.id"), nullable=True)
    section_id = Column(UUID(as_uuid=True), ForeignKey("document_sections.id"), nullable=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    context = Column(Text, nullable=True)
    language = Column(String, ForeignKey("languages.code"), nullable=False)
    usage_count = Column(Integer, default=0)
    last_used = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    document = relationship("Document", back_populates="qa_pairs")
    chapter = relationship("DocumentChapter", back_populates="qa_pairs")
    section = relationship("DocumentSection", back_populates="qa_pairs")
    language_rel = relationship("Language", back_populates="qa_pairs")

    __table_args__ = (
        CheckConstraint('length(question) > 0 AND length(answer) > 0', name='check_qa_content'),
        CheckConstraint('(chapter_id IS NULL AND section_id IS NULL) OR context IS NOT NULL', name='check_qa_context'),
    ) 