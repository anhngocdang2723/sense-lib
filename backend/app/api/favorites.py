from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.favorite import Favorite
from app.models.user import User
from app.models.document import Document
from app.schemas.favorite import FavoriteCreate, FavoriteResponse

router = APIRouter()

@router.get("/user/favorites", response_model=List[FavoriteResponse])
async def get_user_favorites(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's favorite documents with details"""
    favorites = db.query(Favorite).filter(
        Favorite.user_id == current_user.id
    ).options(
        joinedload(Favorite.document).joinedload(Document.category),
        joinedload(Favorite.document).joinedload(Document.added_by_user)
    ).all()
    return favorites

@router.post("/", response_model=FavoriteResponse)
async def add_favorite(
    data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if already favorited
    fav = db.query(Favorite).filter_by(
        user_id=current_user.id, 
        document_id=data.document_id
    ).first()
    
    if fav:
        raise HTTPException(status_code=400, detail="Already favorited")
    
    fav = Favorite(user_id=current_user.id, document_id=data.document_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    
    # Load document relationship
    db.refresh(fav, attribute_names=['document'])
    return fav

@router.delete("/{document_id}")
async def remove_favorite(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(Favorite).filter_by(
        user_id=current_user.id, 
        document_id=document_id
    ).first()
    
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    
    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}

@router.get("/count/{document_id}")
async def get_favorite_count(
    document_id: UUID,
    db: Session = Depends(get_db)
):
    count = db.query(Favorite).filter_by(document_id=document_id).count()
    return {"favorite_count": count}

@router.get("/check/{document_id}")
async def check_favorite(
    document_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(Favorite).filter_by(
        user_id=current_user.id, 
        document_id=document_id
    ).first()
    return {"is_favorited": bool(fav)}

@router.get("/admin/all", response_model=List[FavoriteResponse])
async def get_all_favorites(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all favorites (admin only)"""
    try:
        favorites = db.query(Favorite).options(
            joinedload(Favorite.user),
            joinedload(Favorite.document)
        ).order_by(Favorite.created_at.desc()).all()
        return favorites
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to fetch favorites: {str(e)}"
        ) 