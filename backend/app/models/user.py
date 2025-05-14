from sqlalchemy import Column, String, Boolean, Integer, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import UserRole

class User(BaseModel):
    __tablename__ = "users"

    email = Column(String, unique=True, index=True, nullable=False)
    username = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=False)
    role = Column(SQLEnum(UserRole), default=UserRole.MEMBER)
    is_active = Column(Boolean, default=True)
    is_verified = Column(Boolean, default=False)
    verification_code = Column(String, nullable=True)
    verification_code_expires = Column(DateTime(timezone=True), nullable=True)
    failed_login_attempts = Column(Integer, default=0)
    lockout_until = Column(DateTime(timezone=True), nullable=True)
    phone_number = Column(String, nullable=True)
    address = Column(String, nullable=True)
    avatar_url = Column(String, nullable=True)
    last_login = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    documents = relationship("Document", back_populates="added_by_user", foreign_keys="Document.added_by")
    comments = relationship("Comment", back_populates="user")
    ratings = relationship("Rating", back_populates="user")
    favorites = relationship("Favorite", back_populates="user")
    sessions = relationship("UserSession", back_populates="user")
    notifications = relationship("Notification", back_populates="user")
    feedback = relationship("Feedback", back_populates="user")
    document_access = relationship("DocumentAccess", back_populates="user")
    access_logs = relationship("AccessLogs", back_populates="user")
    reading_progress = relationship("ReadingProgress", back_populates="user")

    __table_args__ = (
        CheckConstraint('length(email) >= 5', name='check_email_length'),
        CheckConstraint('length(username) >= 3', name='check_username_length'),
        CheckConstraint('failed_login_attempts >= 0', name='check_failed_attempts'),
        CheckConstraint("email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$'", name='check_email_format'),
    ) 