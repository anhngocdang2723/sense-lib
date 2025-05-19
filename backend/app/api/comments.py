from fastapi import APIRouter, Depends, HTTPException, Path
from sqlalchemy.orm import Session, joinedload
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.core.security import get_current_user, get_current_admin_user
from app.models.comment import Comment
from app.models.user import User
from app.schemas.comment import CommentCreate, CommentResponse, CommentStatusUpdate

router = APIRouter()

@router.post("/", response_model=CommentResponse)
def create_comment(
    comment: CommentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new comment for a document"""
    # If it's a reply, check if parent comment exists and belongs to same document
    if comment.parent_id:
        parent_comment = db.query(Comment).filter(Comment.id == comment.parent_id).first()
        if not parent_comment:
            raise HTTPException(status_code=404, detail="Parent comment not found")
        if parent_comment.document_id != comment.document_id:
            raise HTTPException(status_code=400, detail="Parent comment belongs to a different document")
    
    try:
        # Create new comment
        db_comment = Comment(
            **comment.model_dump(),
            user_id=current_user.id
        )
        db.add(db_comment)
        db.commit()
        db.refresh(db_comment)
        
        # Load relationships for response
        db_comment = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user)
        ).filter(Comment.id == db_comment.id).first()
        
        return db_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create comment"
        )

@router.get("/document/{document_id}", response_model=List[CommentResponse])
def get_document_comments(
    document_id: UUID = Path(...),
    db: Session = Depends(get_db)
):
    """Get all top-level comments for a document"""
    try:
        comments = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user)
        ).filter(
            Comment.document_id == document_id,
            Comment.parent_id == None  # Only get top-level comments
        ).order_by(Comment.created_at.desc()).all()
        return comments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch comments"
        )

@router.get("/user/{user_id}", response_model=List[CommentResponse])
def get_user_comments(
    user_id: UUID = Path(...),
    db: Session = Depends(get_db)
):
    """Get all comments by a user"""
    try:
        comments = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user)
        ).filter(
            Comment.user_id == user_id
        ).order_by(Comment.created_at.desc()).all()
        return comments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch user comments"
        )

@router.put("/{comment_id}", response_model=CommentResponse)
def update_comment(
    comment_id: UUID = Path(...),
    content: str = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a comment"""
    try:
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not db_comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if db_comment.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to update this comment")
        
        db_comment.content = content
        db_comment.is_edited = True
        db.commit()
        db.refresh(db_comment)
        
        # Load relationships for response
        db_comment = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.replies).joinedload(Comment.user)
        ).filter(Comment.id == comment_id).first()
        
        return db_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update comment"
        )

@router.delete("/{comment_id}")
def delete_comment(
    comment_id: UUID = Path(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a comment"""
    try:
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not db_comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        if db_comment.user_id != current_user.id:
            raise HTTPException(status_code=403, detail="Not authorized to delete this comment")
        
        # Delete all replies first
        db.query(Comment).filter(Comment.parent_id == comment_id).delete()
        # Then delete the comment
        db.delete(db_comment)
        db.commit()
        
        return {"message": "Comment and its replies deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete comment"
        )

@router.get("/admin/all", response_model=List[CommentResponse])
def get_all_comments(
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Get all comments (admin only)"""
    try:
        comments = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.document)
        ).order_by(Comment.created_at.desc()).all()
        return comments
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Failed to fetch comments"
        )

@router.put("/admin/{comment_id}/status", response_model=CommentResponse)
def update_comment_status(
    comment_id: UUID,
    status_update: CommentStatusUpdate,
    db: Session = Depends(get_db),
    current_admin: User = Depends(get_current_admin_user)
):
    """Update comment status (admin only)"""
    try:
        db_comment = db.query(Comment).filter(Comment.id == comment_id).first()
        if not db_comment:
            raise HTTPException(status_code=404, detail="Comment not found")
        
        db_comment.status = status_update.status
        db.commit()
        db.refresh(db_comment)
        
        # Load relationships for response
        db_comment = db.query(Comment).options(
            joinedload(Comment.user),
            joinedload(Comment.document)
        ).filter(Comment.id == comment_id).first()
        
        return db_comment
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update comment status"
        ) 