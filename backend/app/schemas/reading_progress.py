from datetime import datetime
from typing import Optional, Dict, Any
from uuid import UUID
from pydantic import BaseModel, Field, field_validator, UUID4
from ..models.enums import ReadingProgressType, ReadingProgressStatus, ConflictResolution, ConflictStatus

class LastPosition(BaseModel):
    page: Optional[int] = None
    scale: Optional[float] = None
    rotation: Optional[int] = None
    timestamp: Optional[datetime] = None

class ReadingProgressBase(BaseModel):
    document_id: UUID4
    progress_type: ReadingProgressType
    progress_value: float = Field(..., ge=0)
    status: ReadingProgressStatus = ReadingProgressStatus.READING
    last_position: Optional[LastPosition] = None
    device_id: Optional[str] = None
    conflict_resolution: ConflictResolution = ConflictResolution.LATEST

    @field_validator('progress_value')
    @classmethod
    def validate_progress_value(cls, v, info):
        progress_type = info.data.get('progress_type')
        if progress_type == ReadingProgressType.PERCENTAGE:
            if not 0 <= v <= 100:
                raise ValueError('Percentage must be between 0 and 100')
        elif progress_type == ReadingProgressType.PAGE:
            if not float(v).is_integer() or v < 0:
                raise ValueError('Page must be a non-negative integer')
        return v

class ReadingProgressCreate(ReadingProgressBase):
    pass

class ReadingProgressUpdate(BaseModel):
    progress_type: Optional[ReadingProgressType] = None
    progress_value: Optional[float] = None
    status: Optional[ReadingProgressStatus] = None
    last_position: Optional[LastPosition] = None
    device_id: Optional[str] = None
    session_id: Optional[UUID] = None
    conflict_resolution: Optional[ConflictResolution] = None
    conflict_status: Optional[ConflictStatus] = None
    merged_progress: Optional[Dict[str, Any]] = None
    total_read_time: Optional[int] = None
    session_read_time: Optional[int] = None

class ReadingProgressInDB(ReadingProgressBase):
    id: UUID
    last_read_at: datetime
    total_read_time: int
    session_read_time: int
    synced_at: Optional[datetime]
    ai_recommendation_trigger: bool
    last_sync_device: Optional[str]
    sync_version: int
    conflict_status: Optional[ConflictStatus]
    merged_progress: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ReadingProgress(ReadingProgressInDB):
    pass

class ReadingProgressResponse(ReadingProgressBase):
    id: UUID
    user_id: UUID
    last_read_at: datetime
    total_read_time: int = 0
    session_read_time: int = 0
    synced_at: Optional[datetime] = None
    sync_version: int = 1
    conflict_status: Optional[str] = None
    merged_progress: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True

class ReadingProgressList(BaseModel):
    items: list[ReadingProgressResponse]
    total: int
    page: int
    size: int 