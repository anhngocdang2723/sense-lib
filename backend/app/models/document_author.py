from sqlalchemy import Column, ForeignKey, DateTime, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class DocumentAuthor(BaseModel):
    __tablename__ = "document_author"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    author_id = Column(UUID(as_uuid=True), ForeignKey("authors.id"), nullable=False)
    created_at = Column(DateTime(timezone=True))

    __table_args__ = (
        UniqueConstraint('document_id', 'author_id', name='uq_document_author'),
    ) 