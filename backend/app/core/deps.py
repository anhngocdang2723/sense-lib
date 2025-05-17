from typing import Generator, Optional
from datetime import datetime
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User
from app.models.user_session import UserSession
from app.models.enums import UserRole
from app.core.security import get_current_user, get_current_active_user, oauth2_scheme

def get_db_session() -> Generator:
    try:
        db = get_db()
        yield db
    finally:
        db.close()

def get_current_session(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_active_user),
    token: str = Depends(oauth2_scheme)
) -> UserSession:
    session = db.query(UserSession).filter(
        UserSession.user_id == current_user.id,
        UserSession.token == token,
        UserSession.expires_at > datetime.utcnow()
    ).first()
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid"
        )
    
    return session

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user 