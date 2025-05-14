from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from ..core.deps import get_db, get_current_admin_user
from ..schemas.author import AuthorCreate, AuthorUpdate, AuthorResponse
from ..models.author import Author
from ..models.user import User
from ..models.enums import AuthorStatus
from ..services.slug import SlugService

router = APIRouter()

@router.post("/", response_model=AuthorResponse)
def create_author(
    author: AuthorCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new author (admin only)"""
    # Check for duplicate name
    if db.query(Author).filter(Author.name == author.name).first():
        raise HTTPException(status_code=409, detail="Author name already exists")
    # Always generate slug from name
    base_slug = SlugService.convert_to_slug(author.name)
    author.slug = SlugService.generate_unique_slug(db, Author, base_slug)

    db_author = Author(**author.model_dump())
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    return db_author

@router.get("/", response_model=List[AuthorResponse])
def list_authors(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all authors (admin only)
    - include_inactive: if True, include inactive authors in the response
    """
    query = db.query(Author)
    
    if status:
        query = query.filter(Author.status == status)
    elif not include_inactive:
        query = query.filter(Author.status == AuthorStatus.ACTIVE)
    
    # Order by name
    query = query.order_by(Author.name)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{author_id}", response_model=AuthorResponse)
def get_author(
    author_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific author by ID (admin only)
    - include_inactive: if True, return inactive authors
    """
    query = db.query(Author).filter(Author.id == author_id)
    if not include_inactive:
        query = query.filter(Author.status == AuthorStatus.ACTIVE)
    
    author = query.first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author

@router.put("/{author_id}", response_model=AuthorResponse)
def update_author(
    author_id: UUID,
    author_update: AuthorUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update an author (admin only)"""
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    # If name is updated, check for duplicate name and generate new slug
    if author_update.name:
        if db.query(Author).filter(Author.name == author_update.name, Author.id != author_id).first():
            raise HTTPException(status_code=409, detail="Author name already exists")
        base_slug = SlugService.convert_to_slug(author_update.name)
        author.slug = SlugService.generate_unique_slug(db, Author, base_slug, str(author_id))
    update_data = author_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(author, field, value)
    db.commit()
    db.refresh(author)
    return author

@router.delete("/{author_id}")
def delete_author(
    author_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete an author (admin only)
    - If author is active and has documents: set status to inactive
    - If author is inactive and has no documents: delete permanently
    - If author is active and has no documents: delete permanently
    """
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    # Check if author has documents
    has_documents = db.query(Author).join(Author.documents).filter(Author.id == author_id).first() is not None
    
    if has_documents:
        if author.status == AuthorStatus.ACTIVE:
            # Soft delete: set status to inactive
            author.status = AuthorStatus.INACTIVE
            db.commit()
            return {
                "message": "Author is in use and has been deactivated",
                "status": "deactivated"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete author. It is inactive but still has documents."
            )
    else:
        # No documents, safe to delete
        db.delete(author)
        db.commit()
        return {
            "message": "Author has been permanently deleted",
            "status": "deleted"
        } 