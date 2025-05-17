from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from uuid import UUID

from app.core.database import get_db
from app.models.user_session import UserSession
from app.models.access_logs import AccessLogs
from app.models.enums import AccessLogAction
from app.schemas.session import (
    SessionCreate,
    SessionResponse,
    AccessLogCreate,
    AccessLogResponse,
    SessionListResponse
)
from app.core.security import get_current_user, get_user_from_token
from app.models.user import User

router = APIRouter()

@router.post("/", response_model=SessionResponse)
async def create_session(
    session_data: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_user_from_token)
):
    """Create a new user session"""
    # Check if user already has an active session
    existing_session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if existing_session:
        # Update existing session
        existing_session.token = session_data.token
        existing_session.ip_address = session_data.ip_address
        existing_session.user_agent = session_data.user_agent
        existing_session.expires_at = datetime.utcnow() + timedelta(days=1)
        db.commit()
        return existing_session
    
    # Create new session
    new_session = UserSession(
        user_id=current_user.id,
        token=session_data.token,
        ip_address=session_data.ip_address,
        user_agent=session_data.user_agent,
        expires_at=datetime.utcnow() + timedelta(days=1)
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    return new_session

@router.get("/me", response_model=SessionListResponse)
async def get_my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active sessions for current user"""
    sessions = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.expires_at > datetime.utcnow()
    ).all()
    return {"sessions": sessions}

@router.delete("/{session_id}")
async def delete_session(
    session_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a specific session"""
    session = db.query(UserSession).filter(
        UserSession.id == session_id,
        UserSession.user_id == current_user.id
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    db.delete(session)
    db.commit()
    return {"message": "Session deleted successfully"}

@router.post("/access-logs", response_model=AccessLogResponse)
async def create_access_log(
    log_data: AccessLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new access log entry"""
    new_log = AccessLogs(
        user_id=current_user.id,
        document_id=log_data.document_id,
        action=log_data.action,
        ip_address=log_data.ip_address,
        user_agent=log_data.user_agent,
        session_id=log_data.session_id,
        access_id=log_data.access_id
    )
    db.add(new_log)
    db.commit()
    db.refresh(new_log)
    return new_log

@router.get("/access-logs", response_model=List[AccessLogResponse])
async def get_access_logs(
    document_id: Optional[UUID] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get access logs with optional filters"""
    query = db.query(AccessLogs).filter(AccessLogs.user_id == current_user.id)
    
    if document_id:
        query = query.filter(AccessLogs.document_id == document_id)
    if start_date:
        query = query.filter(AccessLogs.timestamp >= start_date)
    if end_date:
        query = query.filter(AccessLogs.timestamp <= end_date)
    
    logs = query.order_by(AccessLogs.timestamp.desc()).all()
    return logs

@router.get("/access-logs/{log_id}", response_model=AccessLogResponse)
async def get_access_log(
    log_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get a specific access log entry"""
    log = db.query(AccessLogs).filter(
        AccessLogs.id == log_id,
        AccessLogs.user_id == current_user.id
    ).first()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Access log not found"
        )
    
    return log 