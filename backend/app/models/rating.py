from sqlalchemy import Column, String, Text, Integer, DateTime, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class Rating(BaseModel):
    __tablename__ = "ratings"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    rating = Column(Integer, nullable=False)
    comment = Column(Text, nullable=True)

    # Relationships
    user = relationship("User", back_populates="ratings")
    document = relationship("Document", back_populates="ratings")

    __table_args__ = (
        UniqueConstraint('document_id', 'user_id', name='uq_document_user_rating'),
        CheckConstraint('rating >= 1 AND rating <= 5', name='check_rating_range'),
    ) 