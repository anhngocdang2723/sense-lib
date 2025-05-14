from sqlalchemy import Column, String, Text, Boolean, Integer, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel

class FileType(BaseModel):
    __tablename__ = "file_types"

    extension = Column(String, unique=True, nullable=False)
    mime_type = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_allowed = Column(Boolean, default=True)
    max_size_mb = Column(Integer, nullable=True)

    # Relationships
    documents = relationship("Document", back_populates="file_type_rel")

    __table_args__ = (
        CheckConstraint("extension ~ '^[a-zA-Z0-9]+$'", name='check_extension'),
        CheckConstraint('max_size_mb IS NULL OR max_size_mb > 0', name='check_max_size'),
    ) 