from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, func
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import FeedbackStatus

class Feedback(BaseModel):
    __tablename__ = "feedback"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    status = Column(SQLEnum(FeedbackStatus), default=FeedbackStatus.PENDING)
    response = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    user = relationship("User", back_populates="feedback")

    __table_args__ = (
        CheckConstraint("email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='check_feedback_email'),
        CheckConstraint('length(message) > 0', name='check_feedback_message'),
    ) 