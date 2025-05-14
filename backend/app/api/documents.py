from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Path
from typing import List, Any, Optional
from uuid import UUID
from datetime import datetime
import os
import hashlib
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.models import User, Document, DocumentStatus, DocumentAccessLevel, FileType, Category, UserRole
from app.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse, DocumentList
from app.services.document import DocumentProcessor
from app.services.vector import VectorStore

router = APIRouter(prefix="/documents", tags=["documents"])

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    title: str = Query(..., description="Document title"),
    category_id: UUID = Query(..., description="Document category ID"),
    description: Optional[str] = Query(None, description="Document description"),
    publisher_id: Optional[UUID] = Query(None, description="Publisher ID"),
    publication_year: Optional[int] = Query(None, description="Publication year"),
    isbn: Optional[str] = Query(None, description="ISBN"),
    language: str = Query("en", description="Document language code"),
    access_level: DocumentAccessLevel = Query(DocumentAccessLevel.PUBLIC, description="Document access level")
) -> DocumentResponse:
    """
    Upload and process a document with metadata
    """
    try:
        # Validate file type
        file_ext = os.path.splitext(file.filename)[1].lower()[1:]  # Remove the dot
        file_type = db.query(FileType).filter(FileType.extension == file_ext).first()
        if not file_type or not file_type.is_allowed:
            raise HTTPException(
                status_code=400,
                detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Read file content and validate size
        content = await file.read()
        if len(content) > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"File size exceeds maximum allowed size of {settings.MAX_FILE_SIZE/1024/1024}MB"
            )
        
        # Calculate file hash
        hasher = hashlib.md5()
        hasher.update(content)
        file_hash = hasher.hexdigest()
        
        # Check for duplicate file
        existing = db.query(Document).filter(Document.file_hash == file_hash).first()
        if existing:
            raise HTTPException(status_code=400, detail="File already exists in the library")
        
        # Validate category
        category = db.query(Category).filter(Category.id == category_id).first()
        if not category:
            raise HTTPException(status_code=400, detail="Invalid category ID")
        
        # Save file
        timestamp = int(datetime.utcnow().timestamp())
        safe_filename = f"{timestamp}_{file.filename}"
        file_path = os.path.join(settings.UPLOAD_DIR, safe_filename)
        with open(file_path, "wb") as buffer:
            buffer.write(content)
        
        # Process document
        doc_processor = DocumentProcessor()
        chunks, metadata_list = doc_processor.process_file(file_path)
        if not chunks:
            raise HTTPException(status_code=400, detail="Failed to process document")
        
        # Store in vector database
        vector_store = VectorStore(
            qdrant_url=settings.QDRANT_URL,
            qdrant_api_key=settings.QDRANT_API_KEY
        )
        
        success = vector_store.store_documents(chunks, metadata_list)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to store document in vector database")
        
        # Create document record
        document = Document(
            title=title,
            description=description,
            publisher_id=publisher_id,
            publication_year=publication_year,
            isbn=isbn,
            file_name=safe_filename,
            file_type=file_type.id,
            file_size=len(content),
            file_hash=file_hash,
            status=DocumentStatus.PENDING,
            category_id=category_id,
            language=language,
            access_level=access_level,
            added_by=current_user.id
        )
        
        try:
            db.add(document)
            db.commit()
            db.refresh(document)
            return document
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Database integrity error: {str(e.orig)}")
        except Exception as e:
            db.rollback()
            raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")
            
    except HTTPException as e:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

@router.get("/list", response_model=DocumentList)
async def list_documents(
    skip: int = Query(0, ge=0),
    limit: int = Query(10, ge=1, le=100),
    category_id: Optional[UUID] = None,
    publisher_id: Optional[UUID] = None,
    status: Optional[DocumentStatus] = None,
    access_level: Optional[DocumentAccessLevel] = None,
    search: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentList:
    """
    List documents with filtering and pagination
    """
    try:
        query = db.query(Document)
        
        # Apply filters
        if category_id:
            query = query.filter(Document.category_id == category_id)
        if publisher_id:
            query = query.filter(Document.publisher_id == publisher_id)
        if status:
            query = query.filter(Document.status == status)
        if access_level:
            query = query.filter(Document.access_level == access_level)
        if search:
            query = query.filter(
                (Document.title.ilike(f"%{search}%")) |
                (Document.description.ilike(f"%{search}%"))
            )
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        documents = query.offset(skip).limit(limit).all()
        
        return DocumentList(
            total=total,
            skip=skip,
            limit=limit,
            documents=documents
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """
    Get document details by ID
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    return document

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_data: DocumentUpdate,
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """
    Update document metadata
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Update fields if provided
    update_data = document_data.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(document, field, value)
    
    document.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(document)
    
    return document

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Delete a document (admin only)
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403,
            detail="Not authorized to delete documents"
        )
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )
    
    # Delete file
    file_path = os.path.join(settings.UPLOAD_DIR, document.file_name)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete from database
    db.delete(document)
    db.commit()
    
    return {"message": "Document deleted successfully"} 