from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from .database import get_db
from ..models.user import User
from ..models.enums import UserRole
from .security import get_current_user

def get_current_admin_user(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="The user doesn't have enough privileges"
        )
    return current_user 