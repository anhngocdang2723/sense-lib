from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from uuid import UUID
from ..core.deps import get_db, get_current_admin_user
from ..schemas.category import CategoryCreate, CategoryUpdate, CategoryResponse, CategoryNested, CategoryFlat
from ..models.category import Category
from ..models.user import User
from ..models.enums import CategoryStatus
from ..services.slug import SlugService
from sqlalchemy import func
import re
import unicodedata

router = APIRouter()

def convert_to_slug(text: str) -> str:
    """
    Convert text to URL-friendly slug
    Example: "Sách Khoa Học" -> "sach-khoa-hoc"
    """
    # Convert to lowercase and normalize unicode characters
    text = unicodedata.normalize('NFKD', text.lower())
    # Remove non-alphanumeric characters and replace spaces with hyphens
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    # Replace multiple spaces or hyphens with single hyphen
    text = re.sub(r'[\s-]+', '-', text)
    # Remove leading/trailing hyphens
    return text.strip('-')

def generate_unique_slug(db: Session, base_slug: str) -> str:
    """Generate a unique slug by appending a number if the base slug exists"""
    slug = base_slug
    counter = 1
    while db.query(Category).filter(Category.slug == slug).first() is not None:
        slug = f"{base_slug}-{counter}"
        counter += 1
    return slug

@router.post("/", response_model=CategoryNested)
def create_category(
    category: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new category (admin only)"""
    # Always generate slug from name
    base_slug = SlugService.convert_to_slug(category.name)
    category.slug = SlugService.generate_unique_slug(db, Category, base_slug)

    # Check if parent_id exists if provided
    if category.parent_id:
        parent = db.query(Category).filter(Category.id == category.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )

    db_category = Category(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@router.get("/", response_model=List[CategoryFlat])
def list_categories(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all categories (admin only)
    - include_inactive: if True, include inactive categories in the response
    """
    # Get all categories without filtering by parent_id
    query = db.query(Category)
    
    if status:
        query = query.filter(Category.status == status)
    elif not include_inactive:
        query = query.filter(Category.status == CategoryStatus.ACTIVE)
    
    # Order by parent_id (null first) and then by name
    query = query.order_by(Category.parent_id.is_(None).desc(), Category.name)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{category_id}", response_model=CategoryFlat)
def get_category(
    category_id: UUID,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific category by ID (admin only)
    - include_inactive: if True, return inactive categories
    """
    query = db.query(Category).filter(Category.id == category_id)
    if not include_inactive:
        query = query.filter(Category.status == CategoryStatus.ACTIVE)
    
    category = query.first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category

@router.put("/{category_id}", response_model=CategoryNested)
def update_category(
    category_id: UUID,
    category_update: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a category (admin only)"""
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # If name is updated, generate new slug
    if category_update.name:
        base_slug = SlugService.convert_to_slug(category_update.name)
        # Update slug directly on the category object
        category.slug = SlugService.generate_unique_slug(db, Category, base_slug, str(category_id))
    
    # Check if parent_id exists if provided
    if category_update.parent_id:
        parent = db.query(Category).filter(Category.id == category_update.parent_id).first()
        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent category not found"
            )
        # Prevent circular reference
        if category_update.parent_id == category_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Category cannot be its own parent"
            )
    
    update_data = category_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(category, field, value)
    
    db.commit()
    db.refresh(category)
    return category

@router.delete("/{category_id}")
def delete_category(
    category_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a category (admin only)
    - If category has children: prevent deletion
    - If category is active and has documents: set status to inactive
    - If category is inactive and has no documents: delete permanently
    - If category is active and has no documents: delete permanently
    """
    category = db.query(Category).filter(Category.id == category_id).first()
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    
    # Check if category has children
    if category.children:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete category with children. Delete children first."
        )
    
    # Check if category has documents
    has_documents = db.query(Category).join(Category.documents).filter(Category.id == category_id).first() is not None
    
    if has_documents:
        if category.status == CategoryStatus.ACTIVE:
            # Soft delete: set status to inactive
            category.status = CategoryStatus.INACTIVE
            db.commit()
            return {
                "message": "Category is in use and has been deactivated",
                "status": "deactivated"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete category. It is inactive but still has documents."
            )
    else:
        # No documents, safe to delete
        db.delete(category)
        db.commit()
        return {
            "message": "Category has been permanently deleted",
            "status": "deleted"
        } 