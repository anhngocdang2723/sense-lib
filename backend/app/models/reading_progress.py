from sqlalchemy import Column, String, Integer, Float, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint, UniqueConstraint, Index, Boolean, func, text
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID, JSONB
from .base import BaseModel
from .enums import ReadingProgressType, ReadingProgressStatus, ConflictResolution, ConflictStatus

class ReadingProgress(BaseModel):
    __tablename__ = "reading_progress"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    chapter_id = Column(UUID(as_uuid=True), ForeignKey("document_chapters.id"), nullable=True)
    progress_type = Column(SQLEnum(ReadingProgressType), nullable=False)
    progress_value = Column(Float, nullable=False)
    status = Column(SQLEnum(ReadingProgressStatus), default=ReadingProgressStatus.READING)
    last_read_at = Column(DateTime(timezone=True), server_default=func.now())
    total_read_time = Column(Integer, default=0, comment="Total reading time in seconds")
    session_read_time = Column(Integer, default=0, comment="Reading time for current session in seconds")
    last_position = Column(JSONB, nullable=True, comment="Additional position data like scroll position, zoom level, etc.")
    device_id = Column(String, nullable=True, comment="Identifier for the device updating progress")
    session_id = Column(UUID(as_uuid=True), ForeignKey("user_sessions.id"), nullable=True)
    synced_at = Column(DateTime(timezone=True), nullable=True, comment="Last sync time for offline progress")
    ai_recommendation_trigger = Column(Boolean, default=False, comment="Flag for AI recommendation triggers")
    section_id = Column(UUID(as_uuid=True), ForeignKey("document_sections.id"), nullable=True)
    conflict_resolution = Column(SQLEnum(ConflictResolution), default=ConflictResolution.LATEST)
    last_sync_device = Column(String, nullable=True)
    sync_version = Column(Integer, default=1)
    conflict_status = Column(SQLEnum(ConflictStatus), nullable=True)
    merged_progress = Column(JSONB, nullable=True, comment="Stores progress data from other devices when merging")

    # Relationships
    user = relationship("User", back_populates="reading_progress")
    document = relationship("Document", back_populates="reading_progress")
    chapter = relationship("DocumentChapter")
    section = relationship("DocumentSection")
    session = relationship("UserSession")

    __table_args__ = (
        UniqueConstraint('user_id', 'document_id', 'chapter_id', 'section_id', name='uq_user_document_chapter_section_progress'),
        CheckConstraint(
            text("(progress_type::text = 'percentage' AND progress_value >= 0 AND progress_value <= 100) OR progress_type::text != 'percentage'"),
            name='check_progress_value_percentage'
        ),
        CheckConstraint(
            text("(progress_type::text = 'page' AND progress_value >= 0 AND progress_value = FLOOR(progress_value)) OR progress_type::text != 'page'"),
            name='check_progress_value_page'
        ),
        CheckConstraint(
            text("(progress_type::text = 'position' AND progress_value >= 0) OR progress_type::text != 'position'"),
            name='check_progress_value_position'
        ),
        CheckConstraint(
            text("(progress_type::text = 'time' AND progress_value >= 0) OR progress_type::text != 'time'"),
            name='check_progress_value_time'
        ),
        CheckConstraint('total_read_time >= 0', name='check_total_read_time'),
        CheckConstraint('session_read_time >= 0', name='check_session_read_time'),
        CheckConstraint('last_position IS NULL OR last_position::text != \'{}\'', name='check_last_position'),
        CheckConstraint('sync_version > 0', name='check_sync_version'),
        CheckConstraint(
            text("(conflict_resolution::text = 'manual' AND conflict_status IS NOT NULL) OR conflict_resolution::text != 'manual'"),
            name='check_conflict_status'
        ),
        Index('idx_reading_progress_user', 'user_id'),
        Index('idx_reading_progress_document', 'document_id'),
        Index('idx_reading_progress_last_read', 'last_read_at'),
        Index('idx_reading_progress_user_last_read', 'user_id', 'last_read_at'),
        Index('idx_reading_progress_document_chapter', 'document_id', 'chapter_id'),
        Index('idx_reading_progress_sync', 'synced_at'),
        Index('idx_reading_progress_section', 'section_id'),
        Index('idx_reading_progress_sync_version', 'sync_version'),
        Index('idx_reading_progress_user_document_section', 'user_id', 'document_id', 'section_id'),
        Index('idx_reading_progress_conflict', 'conflict_status'),
    ) 