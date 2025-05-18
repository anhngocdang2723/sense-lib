from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session
from uuid import UUID
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.favorite import Favorite
from app.models.user import User
from app.schemas.favorite import FavoriteCreate, FavoriteResponse

router = APIRouter()

@router.post("/", response_model=FavoriteResponse)
def add_favorite(
    data: FavoriteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if already favorited
    fav = db.query(Favorite).filter_by(user_id=current_user.id, document_id=data.document_id).first()
    if fav:
        raise HTTPException(status_code=400, detail="Already favorited")
    fav = Favorite(user_id=current_user.id, document_id=data.document_id)
    db.add(fav)
    db.commit()
    db.refresh(fav)
    return fav

@router.delete("/{document_id}")
def remove_favorite(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(Favorite).filter_by(user_id=current_user.id, document_id=document_id).first()
    if not fav:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(fav)
    db.commit()
    return {"message": "Removed from favorites"}

@router.get("/count/{document_id}")
def favorite_count(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db)
):
    count = db.query(Favorite).filter_by(document_id=document_id).count()
    return {"favorite_count": count}

@router.get("/user/{document_id}")
def is_favorited(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    fav = db.query(Favorite).filter_by(user_id=current_user.id, document_id=document_id).first()
    return {"favorited": bool(fav)} 