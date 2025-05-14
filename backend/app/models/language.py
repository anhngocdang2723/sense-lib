from sqlalchemy import Column, String, Boolean, DateTime, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from .base import BaseModel

class Language(BaseModel):
    __tablename__ = "languages"

    code = Column(String, primary_key=True, unique=True)
    name = Column(String, nullable=False)
    native_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)

    # Relationships
    documents = relationship("Document", back_populates="language_rel")
    voices = relationship("Voice", back_populates="language_rel")
    audio_files = relationship("DocumentAudio", back_populates="language_rel")
    qa_pairs = relationship("DocumentQA", back_populates="language_rel")

    __table_args__ = (
        CheckConstraint("code ~ '^[a-z]{2}$'", name='check_language_code'),
        UniqueConstraint('code', name='uq_language_code'),
    ) 