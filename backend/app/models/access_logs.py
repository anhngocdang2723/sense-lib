from sqlalchemy import Column, String, DateTime, Enum as SQLEnum, ForeignKey, Index, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import AccessLogAction

class AccessLogs(BaseModel):
    __tablename__ = "access_logs"

    access_id = Column(UUID(as_uuid=True), ForeignKey("document_access.id"), nullable=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    action = Column(SQLEnum(AccessLogAction), nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    ip_address = Column(String, nullable=True)
    user_agent = Column(String, nullable=True)
    session_id = Column(UUID(as_uuid=True), ForeignKey("user_sessions.id"), nullable=True)

    # Relationships
    user = relationship("User", back_populates="access_logs")
    document = relationship("Document", back_populates="access_logs")
    session = relationship("UserSession")
    access = relationship("DocumentAccess")

    __table_args__ = (
        Index('idx_access_logs_user', 'user_id'),
        Index('idx_access_logs_document', 'document_id'),
        Index('idx_access_logs_timestamp', 'timestamp'),
        Index('idx_access_logs_user_document', 'user_id', 'document_id'),
    ) 