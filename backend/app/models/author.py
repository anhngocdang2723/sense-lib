from sqlalchemy import Column, String, Text, Enum as SQLEnum, CheckConstraint, Date, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import AuthorStatus

class Author(BaseModel):
    __tablename__ = "authors"

    name = Column(String, unique=True, nullable=False, index=True)
    slug = Column(String, unique=True, nullable=False, index=True)
    bio = Column(Text, nullable=True)
    email = Column(String, nullable=True)
    website = Column(String, nullable=True)
    birth_date = Column(Date, nullable=True)
    death_date = Column(Date, nullable=True)
    nationality = Column(String, nullable=True)
    status = Column(SQLEnum(AuthorStatus), default=AuthorStatus.ACTIVE)

    # Relationships
    documents = relationship(
        "Document",
        secondary="document_author",
        back_populates="authors",
        primaryjoin="Author.id == DocumentAuthor.author_id",
        secondaryjoin="Document.id == DocumentAuthor.document_id"
    )

    __table_args__ = (
        CheckConstraint('length(name) >= 2', name='check_author_name'),
        CheckConstraint("email IS NULL OR email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'", name='check_author_email'),
        CheckConstraint("birth_date IS NULL OR death_date IS NULL OR birth_date < death_date", name='check_author_dates'),
    ) 