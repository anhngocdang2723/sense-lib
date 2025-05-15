from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from ..core.deps import get_db, get_current_admin_user
from ..schemas.language import LanguageCreate, LanguageUpdate, LanguageResponse
from ..models.language import Language
from ..models.user import User

router = APIRouter()

@router.post("/", response_model=LanguageResponse)
def create_language(
    language: LanguageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Create a new language (admin only)"""
    # Check for duplicate code
    if db.query(Language).filter(Language.code == language.code).first():
        raise HTTPException(status_code=409, detail="Language code already exists")
    
    db_language = Language(**language.model_dump())
    db.add(db_language)
    db.commit()
    db.refresh(db_language)
    return db_language

@router.get("/", response_model=List[LanguageResponse])
def list_languages(
    skip: int = 0,
    limit: int = 100,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """List all languages (admin only)
    - include_inactive: if True, include inactive languages in the response
    """
    query = db.query(Language)
    
    if not include_inactive:
        query = query.filter(Language.is_active == True)
    
    # Order by name
    query = query.order_by(Language.name)
    
    return query.offset(skip).limit(limit).all()

@router.get("/{language_code}", response_model=LanguageResponse)
def get_language(
    language_code: str,
    include_inactive: bool = False,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Get a specific language by code (admin only)
    - include_inactive: if True, return inactive languages
    """
    query = db.query(Language).filter(Language.code == language_code)
    if not include_inactive:
        query = query.filter(Language.is_active == True)
    
    language = query.first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    return language

@router.put("/{language_code}", response_model=LanguageResponse)
def update_language(
    language_code: str,
    language_update: LanguageUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Update a language (admin only)"""
    language = db.query(Language).filter(Language.code == language_code).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")

    update_data = language_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(language, field, value)
    
    db.commit()
    db.refresh(language)
    return language

@router.delete("/{language_code}")
def delete_language(
    language_code: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin_user)
):
    """Delete a language (admin only)
    - If language is active and has documents: set is_active to False
    - If language is inactive and has no documents: delete permanently
    - If language is active and has no documents: delete permanently
    """
    language = db.query(Language).filter(Language.code == language_code).first()
    if not language:
        raise HTTPException(status_code=404, detail="Language not found")
    
    # Check if language has documents
    has_documents = (
        db.query(Language)
        .join(Language.documents)
        .filter(Language.code == language_code)
        .first() is not None
    )
    
    if has_documents:
        if language.is_active:
            # Soft delete: set is_active to False
            language.is_active = False
            db.commit()
            return {
                "message": "Language is in use and has been deactivated",
                "status": "deactivated"
            }, status.HTTP_200_OK
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete language. It is inactive but still has documents."
            )
    else:
        # No documents, safe to delete
        db.delete(language)
        db.commit()
        return {
            "message": "Language has been permanently deleted",
            "status": "deleted"
        }, status.HTTP_200_OK 