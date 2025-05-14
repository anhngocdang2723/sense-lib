from sqlalchemy import Column, String, Text, Enum as SQLEnum, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import TagStatus

class Tag(BaseModel):
    __tablename__ = "tags"

    name = Column(String, unique=True, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    description = Column(Text, nullable=True)
    status = Column(SQLEnum(TagStatus), default=TagStatus.ACTIVE)

    # Relationships
    documents = relationship("Document", secondary="document_tag", back_populates="tags")

    __table_args__ = (
        CheckConstraint('length(name) >= 2', name='check_tag_name'),
    ) 