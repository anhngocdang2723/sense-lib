from sqlalchemy import Column, String, Integer, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import DocumentAccessStatus

class DocumentAccess(BaseModel):
    __tablename__ = "document_access"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    granted_at = Column(DateTime(timezone=True), server_default=func.now())
    expiry_date = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(DocumentAccessStatus), default=DocumentAccessStatus.ACTIVE)
    access_count = Column(Integer, default=0)
    last_accessed = Column(DateTime(timezone=True), nullable=True)
    extension_count = Column(Integer, default=0)
    revoked_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    user = relationship("User", back_populates="document_access")
    document = relationship("Document", back_populates="access_records")

    __table_args__ = (
        CheckConstraint('access_count >= 0', name='check_access_count'),
        CheckConstraint('extension_count >= 0', name='check_extension_count'),
    ) 