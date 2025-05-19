from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID
from sqlalchemy import func

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.rating import Rating
from app.models.user import User
from app.schemas.rating import RatingCreate, RatingResponse

router = APIRouter()

@router.post("/", response_model=RatingResponse)
def create_rating(
    rating: RatingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new rating for a document"""
    # Check if user already rated this document
    existing_rating = db.query(Rating).filter(
        Rating.document_id == rating.document_id,
        Rating.user_id == current_user.id
    ).first()
    
    if existing_rating:
        # Update existing rating instead of creating new one
        existing_rating.rating = rating.rating
        existing_rating.comment = rating.comment
        db.commit()
        db.refresh(existing_rating)
        return existing_rating
    
    # Create new rating
    db_rating = Rating(
        **rating.model_dump(),
        user_id=current_user.id
    )
    
    try:
        db.add(db_rating)
        db.commit()
        db.refresh(db_rating)
        return db_rating
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create rating"
        )

@router.get("/document/{document_id}", response_model=List[RatingResponse])
def get_document_ratings(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db)
):
    """Get all ratings for a document"""
    ratings = db.query(Rating).options(
        joinedload(Rating.user)
    ).filter(
        Rating.document_id == document_id
    ).all()
    return ratings

@router.get("/document/{document_id}/average")
def get_document_average_rating(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db)
):
    """Get average rating and count for a document"""
    result = db.query(
        func.avg(Rating.rating).label('average'),
        func.count(Rating.id).label('count')
    ).filter(Rating.document_id == document_id).first()
    
    return {
        "average": float(result.average) if result.average else 0.0,
        "count": result.count
    }

@router.get("/user/document/{document_id}")
def get_user_document_rating(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get current user's rating for a document"""
    rating = db.query(Rating).filter(
        Rating.document_id == document_id,
        Rating.user_id == current_user.id
    ).first()
    
    return {
        "rating": rating.rating if rating else None,
        "comment": rating.comment if rating else None
    }

@router.put("/{rating_id}", response_model=RatingResponse)
def update_rating(
    rating_id: UUID = Path(...),
    rating: RatingCreate = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a rating"""
    db_rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not db_rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    if db_rating.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to update this rating")
    
    try:
        for key, value in rating.model_dump().items():
            setattr(db_rating, key, value)
        db.commit()
        db.refresh(db_rating)
        return db_rating
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update rating"
        )

@router.delete("/{rating_id}")
def delete_rating(
    rating_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a rating"""
    db_rating = db.query(Rating).filter(Rating.id == rating_id).first()
    if not db_rating:
        raise HTTPException(status_code=404, detail="Rating not found")
    if db_rating.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this rating")
    
    try:
        db.delete(db_rating)
        db.commit()
        return {"message": "Rating deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete rating"
        )

@router.get("/admin/all", response_model=List[RatingResponse])
def get_all_ratings(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all ratings (admin only)"""
    try:
        ratings = db.query(Rating).options(
            joinedload(Rating.user),
            joinedload(Rating.document)
        ).order_by(Rating.created_at.desc()).all()
        return ratings
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch ratings"
        ) 