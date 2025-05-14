from sqlalchemy import Column, String, Text, Enum as SQLEnum, Boolean, DateTime, Integer, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import PublisherStatus

class Publisher(BaseModel):
    __tablename__ = "publishers"

    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    website = Column(String, nullable=True)
    email = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(Text, nullable=True)
    status = Column(SQLEnum(PublisherStatus), default=PublisherStatus.ACTIVE)

    # Relationships
    documents = relationship("Document", back_populates="publisher")

    __table_args__ = (
        CheckConstraint('length(name) >= 2', name='check_publisher_name'),
        UniqueConstraint('name', name='uq_publisher_name'),
        CheckConstraint("email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='check_publisher_email'),
        CheckConstraint("phone IS NULL OR phone ~ '^\\+?[0-9\\s-()]{8,20}$'", name='check_publisher_phone'),
    ) 