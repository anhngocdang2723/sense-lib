from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as SQLEnum, ForeignKey, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import NotificationType, NotificationRelatedType

class Notification(BaseModel):
    __tablename__ = "notifications"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    type = Column(SQLEnum(NotificationType), nullable=False)
    content = Column(Text, nullable=False)
    related_id = Column(UUID(as_uuid=True), nullable=True)
    related_type = Column(SQLEnum(NotificationRelatedType), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="notifications")