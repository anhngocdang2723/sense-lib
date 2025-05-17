from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from ..models.enums import AccessLogAction

class SessionBase(BaseModel):
    token: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None

class SessionCreate(SessionBase):
    pass

class SessionResponse(SessionBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    expires_at: datetime

    class Config:
        from_attributes = True

class SessionListResponse(BaseModel):
    sessions: List[SessionResponse]

class AccessLogBase(BaseModel):
    document_id: UUID
    action: AccessLogAction
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    session_id: Optional[UUID] = None
    access_id: Optional[UUID] = None

class AccessLogCreate(AccessLogBase):
    pass

class AccessLogResponse(AccessLogBase):
    id: UUID
    user_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True 