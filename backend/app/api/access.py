from fastapi import APIRouter, Depends, HTTPException, Query, Path
from typing import List, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..auth.jwt import get_current_user
from ..models import Document, User, DocumentStatus, DocumentAccess, AccessLogs

router = APIRouter()

@router.post("/request/{document_id}")
async def request_access(
    document_id: int = Path(..., ge=1),
    duration_days: int = Query(7, ge=1, le=30, description="Number of days to access the document"),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Request access to a document
    """
    # Check if document exists
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Check if user has reached maximum concurrent access limit
    active_access = db.query(DocumentAccess).filter(
        DocumentAccess.user_id == current_user.id,
        DocumentAccess.status == "active"
    ).count()
    
    if active_access >= settings.MAX_CONCURRENT_ACCESS:
        raise HTTPException(
            status_code=400,
            detail=f"Maximum number of concurrent access ({settings.MAX_CONCURRENT_ACCESS}) reached"
        )
    
    # Create access record
    expiry_date = datetime.utcnow() + timedelta(days=duration_days)
    access = DocumentAccess(
        document_id=document_id,
        user_id=current_user.id,
        expiry_date=expiry_date,
        status="active",
        access_count=0
    )
    
    db.add(access)
    db.commit()
    db.refresh(access)
    
    return {
        "message": "Document access granted",
        "access_id": access.id,
        "expiry_date": expiry_date
    }

@router.post("/extend/{access_id}")
async def extend_access(
    access_id: int = Path(..., ge=1),
    additional_days: int = Query(7, ge=1, le=30, description="Additional days to extend access"),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Extend document access period
    """
    access = db.query(DocumentAccess).filter(DocumentAccess.id == access_id).first()
    if not access:
        raise HTTPException(
            status_code=404,
            detail="Access record not found"
        )
    
    if access.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to extend this access"
        )
    
    if access.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Cannot extend inactive access"
        )
    
    if access.extension_count >= settings.MAX_ACCESS_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Maximum number of extensions reached"
        )
    
    # Update access record
    access.expiry_date = access.expiry_date + timedelta(days=additional_days)
    access.extension_count += 1
    
    db.commit()
    db.refresh(access)
    
    return {
        "message": "Access extended successfully",
        "new_expiry_date": access.expiry_date
    }

@router.post("/revoke/{access_id}")
async def revoke_access(
    access_id: int = Path(..., ge=1),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Revoke document access
    """
    access = db.query(DocumentAccess).filter(DocumentAccess.id == access_id).first()
    if not access:
        raise HTTPException(
            status_code=404,
            detail="Access record not found"
        )
    
    if access.user_id != current_user.id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to revoke this access"
        )
    
    if access.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Access is already inactive"
        )
    
    # Update access record
    access.status = "revoked"
    access.revoked_at = datetime.utcnow()
    
    db.commit()
    db.refresh(access)
    
    return {
        "message": "Access revoked successfully"
    }

@router.get("/list")
async def list_access(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    status: Optional[str] = None,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List document access records with filtering and pagination
    """
    query = db.query(DocumentAccess)
    
    # Filter by status if provided
    if status:
        query = query.filter(DocumentAccess.status == status)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    access_records = query.offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "access_records": access_records
    }

@router.get("/user/{user_id}")
async def list_user_access(
    user_id: int = Path(..., ge=1),
    status: Optional[str] = None,
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    List access records for a specific user
    """
    # Check if user exists
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found"
        )
    
    # Check authorization
    if current_user.id != user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=403,
            detail="Not authorized to view these access records"
        )
    
    query = db.query(DocumentAccess).filter(DocumentAccess.user_id == user_id)
    
    # Filter by status if provided
    if status:
        query = query.filter(DocumentAccess.status == status)
    
    access_records = query.all()
    
    return {
        "user_id": user_id,
        "access_records": access_records
    }

@router.post("/track/{access_id}")
async def track_access(
    access_id: int = Path(..., ge=1),
    action: str = Query(..., description="Access action (view, download, etc.)"),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Track document access activity
    """
    access = db.query(DocumentAccess).filter(DocumentAccess.id == access_id).first()
    if not access:
        raise HTTPException(
            status_code=404,
            detail="Access record not found"
        )
    
    if access.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to track this access"
        )
    
    if access.status != "active":
        raise HTTPException(
            status_code=400,
            detail="Cannot track inactive access"
        )
    
    # Update access record
    access.access_count += 1
    access.last_accessed = datetime.utcnow()
    
    # Create access log
    access_log = AccessLogs(
        access_id=access_id,
        action=action,
        timestamp=datetime.utcnow()
    )
    
    db.add(access_log)
    db.commit()
    db.refresh(access)
    
    return {
        "message": "Access tracked successfully",
        "access_count": access.access_count
    } 