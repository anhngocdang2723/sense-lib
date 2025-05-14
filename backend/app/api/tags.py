from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID
from ..core.deps import get_db, get_current_admin_user
from ..schemas.tag import TagCreate, TagUpdate, TagResponse
from ..models.tag import Tag
from ..models.user import User
from ..models.enums import TagStatus
from ..services.slug import SlugService

router = APIRouter()

@router.post("/", response_model=TagResponse)
def create_tag(
    tag: TagCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new tag (admin only)"""
    # Check for duplicate name
    if db.query(Tag).filter(Tag.name == tag.name).first():
        raise HTTPException(status_code=409, detail="Tag name already exists")
    # Always generate slug from name
    base_slug = SlugService.convert_to_slug(tag.name)
    tag.slug = SlugService.generate_unique_slug(db, Tag, base_slug)

    db_tag = Tag(**tag.model_dump())
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag

@router.get("/", response_model=List[TagResponse])
def list_tags(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all tags (admin only)
    - include_inactive: if True, include inactive tags in the response
    """
    query = db.query(Tag)
    
    if status:
        query = query.filter(Tag.status == status)
    elif not include_inactive:
        query = query.filter(Tag.status == TagStatus.ACTIVE)
    
    # Order by name
    query = query.order_by(Tag.name)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{tag_id}", response_model=TagResponse)
def get_tag(
    tag_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific tag by ID (admin only)
    - include_inactive: if True, return inactive tags
    """
    query = db.query(Tag).filter(Tag.id == tag_id)
    if not include_inactive:
        query = query.filter(Tag.status == TagStatus.ACTIVE)
    
    tag = query.first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return tag

@router.put("/{tag_id}", response_model=TagResponse)
def update_tag(
    tag_id: UUID,
    tag_update: TagUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a tag (admin only)"""
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    # If name is updated, check for duplicate name and generate new slug
    if tag_update.name:
        if db.query(Tag).filter(Tag.name == tag_update.name, Tag.id != tag_id).first():
            raise HTTPException(status_code=409, detail="Tag name already exists")
        base_slug = SlugService.convert_to_slug(tag_update.name)
        tag.slug = SlugService.generate_unique_slug(db, Tag, base_slug, str(tag_id))
    update_data = tag_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(tag, field, value)
    db.commit()
    db.refresh(tag)
    return tag

@router.delete("/{tag_id}")
def delete_tag(
    tag_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a tag (admin only)
    - If tag is active and has documents: set status to inactive
    - If tag is inactive and has no documents: delete permanently
    - If tag is active and has no documents: delete permanently
    """
    tag = db.query(Tag).filter(Tag.id == tag_id).first()
    if not tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    
    # Check if tag has documents
    has_documents = db.query(Tag).join(Tag.documents).filter(Tag.id == tag_id).first() is not None
    
    if has_documents:
        if tag.status == TagStatus.ACTIVE:
            # Soft delete: set status to inactive
            tag.status = TagStatus.INACTIVE
            db.commit()
            return {
                "message": "Tag is in use and has been deactivated",
                "status": "deactivated"
            }, status.HTTP_200_OK
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete tag. It is inactive but still has documents."
            )
    else:
        # No documents, safe to delete
        db.delete(tag)
        db.commit()
        return {
            "message": "Tag has been permanently deleted",
            "status": "deleted"
        }, status.HTTP_200_OK 