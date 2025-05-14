from sqlalchemy import Column, String, Boolean, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, Index
from sqlalchemy.orm import relationship
from .base import BaseModel
from .enums import VoiceGender

class Voice(BaseModel):
    __tablename__ = "voices"

    id = Column(String, primary_key=True)
    name = Column(String, nullable=False)
    language = Column(String, ForeignKey("languages.code"), nullable=False)
    gender = Column(SQLEnum(VoiceGender), nullable=True)
    provider = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)

    # Relationships
    language_rel = relationship("Language", back_populates="voices")
    audio_files = relationship("DocumentAudio", back_populates="voice")

    __table_args__ = (
        CheckConstraint("id ~ '^[a-zA-Z0-9_-]+$'", name='check_voice_id'),
        Index('idx_voices_language', 'language'),
        Index('idx_voices_provider', 'provider'),
    ) 