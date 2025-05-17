from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ..core.deps import get_db, get_current_admin_user
from ..schemas.publisher import PublisherCreate, PublisherUpdate, PublisherResponse
from ..models.publisher import Publisher
from ..models.user import User
from ..models.enums import PublisherStatus

router = APIRouter()

@router.post("/", response_model=PublisherResponse)
def create_publisher(
    publisher: PublisherCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new publisher (admin only)"""
    # Check for duplicate name
    if db.query(Publisher).filter(Publisher.name == publisher.name).first():
        raise HTTPException(status_code=409, detail="Publisher name already exists")

    db_publisher = Publisher(**publisher.model_dump())
    db.add(db_publisher)
    db.commit()
    db.refresh(db_publisher)
    return db_publisher

@router.get("/", response_model=List[PublisherResponse])
def list_publishers(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all publishers (admin only)
    - include_inactive: if True, include inactive publishers in the response
    """
    query = db.query(Publisher)
    
    if status:
        query = query.filter(Publisher.status == status)
    elif not include_inactive:
        query = query.filter(Publisher.status == PublisherStatus.ACTIVE)
    
    # Order by name
    query = query.order_by(Publisher.name)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{publisher_id}", response_model=PublisherResponse)
def get_publisher(
    publisher_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific publisher by ID (admin only)
    - include_inactive: if True, return inactive publishers
    """
    query = db.query(Publisher).filter(Publisher.id == publisher_id)
    if not include_inactive:
        query = query.filter(Publisher.status == PublisherStatus.ACTIVE)
    
    publisher = query.first()
    if not publisher:
        raise HTTPException(status_code=404, detail="Publisher not found")
    return publisher

@router.put("/{publisher_id}", response_model=PublisherResponse)
def update_publisher(
    publisher_id: UUID,
    publisher_update: PublisherUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a publisher (admin only)"""
    publisher = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not publisher:
        raise HTTPException(status_code=404, detail="Publisher not found")

    # If name is updated, check for duplicate name
    if publisher_update.name:
        if db.query(Publisher).filter(Publisher.name == publisher_update.name, Publisher.id != publisher_id).first():
            raise HTTPException(status_code=409, detail="Publisher name already exists")

    update_data = publisher_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(publisher, field, value)
    db.commit()
    db.refresh(publisher)
    return publisher

@router.delete("/{publisher_id}")
def delete_publisher(
    publisher_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a publisher (admin only)
    - If publisher is active and has documents: set status to inactive
    - If publisher is inactive and has no documents: delete permanently
    - If publisher is active and has no documents: delete permanently
    """
    publisher = db.query(Publisher).filter(Publisher.id == publisher_id).first()
    if not publisher:
        raise HTTPException(status_code=404, detail="Publisher not found")
    
    # Check if publisher has documents
    has_documents = db.query(Publisher).join(Publisher.documents).filter(Publisher.id == publisher_id).first() is not None
    
    if has_documents:
        if publisher.status == PublisherStatus.ACTIVE:
            # Soft delete: set status to inactive
            publisher.status = PublisherStatus.INACTIVE
            db.commit()
            return {
                "message": "Publisher is in use and has been deactivated",
                "status": "deactivated"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete publisher. It is inactive but still has documents."
            )
    else:
        # No documents, safe to delete
        db.delete(publisher)
        db.commit()
        return {
            "message": "Publisher has been permanently deleted",
            "status": "deleted"
        } 