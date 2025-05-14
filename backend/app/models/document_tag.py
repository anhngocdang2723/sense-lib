from sqlalchemy import Column, ForeignKey, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class DocumentTag(BaseModel):
    __tablename__ = "document_tag"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    tag_id = Column(UUID(as_uuid=True), ForeignKey("tags.id"), nullable=False)

    __table_args__ = (
        UniqueConstraint('document_id', 'tag_id', name='uq_document_tag'),
    ) 