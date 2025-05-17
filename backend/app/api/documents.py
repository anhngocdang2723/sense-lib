from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Path, BackgroundTasks, Form
from typing import List, Any, Optional
from uuid import UUID
from datetime import datetime
import os
import hashlib
import logging
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload

from app.core.database import get_db
from app.core.config import settings
from app.core.security import get_current_user
from app.core.exceptions import (
    BaseAPIException, DocumentException, DuplicateFileError,
    InvalidFileError, FileProcessingError, VectorizationError,
    ValidationError, DatabaseError
)
from app.models import (
    User, Document, DocumentStatus, DocumentAccessLevel, FileType, Category, UserRole,
    DocumentChapter, DocumentSection, DocumentAudio, DocumentQA, ReadingProgress,
    DocumentAudioStatus, ReadingProgressType, ReadingProgressStatus
)
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentList,
    DocumentChapterBase, DocumentSectionBase, DocumentAudioBase, DocumentQABase
)
from app.services.document import DocumentService
# Comment out vector store import
# from app.services.vector import VectorStore

# Configure logger
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse)
async def upload_document(
    title: str = Form(...),
    description: Optional[str] = Form(None),
    category_id: UUID = Form(...),
    publication_year: Optional[int] = Form(None),
    isbn: Optional[str] = Form(None),
    language: str = Form("en"),
    access_level: str = Form("public"),
    version: str = Form("1.0"),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new document"""
    logger.info(f"Starting document upload process for file: {file.filename}")
    logger.info(f"Upload parameters - Title: {title}, Category: {category_id}, Language: {language}")
    
    try:
        # Create DocumentCreate instance from form data
        logger.info("Creating DocumentCreate instance from form data")
        document_data = DocumentCreate(
            title=title,
            description=description,
            category_id=category_id,
            publication_year=publication_year,
            isbn=isbn,
            language=language,
            access_level=access_level,
            version=version
        )
        logger.info("DocumentCreate instance created successfully")
        
        # Process and save document using service
        logger.info("Starting document processing and saving")
        document = await DocumentService.process_and_save_document(
            db=db,
            data=document_data,
            file=file,
            current_user=current_user
        )
        logger.info(f"Document processed and saved successfully with ID: {document.id}")
        
        # Refresh document to ensure all relationships are loaded
        logger.info("Refreshing document to load relationships")
        db.refresh(document)
        logger.info("Document refresh completed")
        
        return document
        
    except DocumentException as e:
        # Log the error with appropriate level based on status code
        if e.status_code >= 500:
            logger.error(f"Server error in upload_document: {str(e)}", exc_info=True)
        else:
            logger.warning(f"Client error in upload_document: {str(e)}")
        
        # If document was created but vectorization failed, update status
        if 'document' in locals():
            try:
                logger.warning("Attempting to update document status to PENDING after error")
                document.status = DocumentStatus.PENDING
                db.commit()
                logger.info("Document status updated to PENDING")
            except Exception as status_error:
                logger.error(f"Failed to update document status: {str(status_error)}", exc_info=True)
        
        # Re-raise the exception to be handled by FastAPI's exception handler
        raise e
        
    except Exception as e:
        logger.error(f"Unexpected error in upload_document: {str(e)}", exc_info=True)
        raise DatabaseError(
            "An unexpected error occurred while uploading the document",
            data={"error": str(e)}
        )

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
    
    # Update view count
    document.view_count += 1
    db.commit()
    
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

# New endpoints for document chapters
@router.post("/{document_id}/chapters", response_model=DocumentChapterBase)
async def create_chapter(
    chapter_data: DocumentChapterBase,
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentChapterBase:
    """
    Create a new chapter for a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    chapter = DocumentChapter(
        document_id=document_id,
        **chapter_data.dict()
    )
    
    db.add(chapter)
    db.commit()
    db.refresh(chapter)
    
    return chapter

# New endpoints for document sections
@router.post("/{document_id}/sections", response_model=DocumentSectionBase)
async def create_section(
    section_data: DocumentSectionBase,
    document_id: UUID = Path(...),
    chapter_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentSectionBase:
    """
    Create a new section for a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if chapter_id:
        chapter = db.query(DocumentChapter).filter(
            DocumentChapter.id == chapter_id,
            DocumentChapter.document_id == document_id
        ).first()
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")
    
    section = DocumentSection(
        document_id=document_id,
        chapter_id=chapter_id,
        **section_data.dict()
    )
    
    db.add(section)
    db.commit()
    db.refresh(section)
    
    return section

# New endpoints for document audio
@router.post("/{document_id}/audio", response_model=DocumentAudioBase)
async def create_audio(
    audio_data: DocumentAudioBase,
    document_id: UUID = Path(...),
    chapter_id: Optional[UUID] = None,
    section_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentAudioBase:
    """
    Create a new audio file for a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if chapter_id:
        chapter = db.query(DocumentChapter).filter(
            DocumentChapter.id == chapter_id,
            DocumentChapter.document_id == document_id
        ).first()
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")
    
    if section_id:
        section = db.query(DocumentSection).filter(
            DocumentSection.id == section_id,
            DocumentSection.document_id == document_id
        ).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
    
    audio = DocumentAudio(
        document_id=document_id,
        chapter_id=chapter_id,
        section_id=section_id,
        status=DocumentAudioStatus.PENDING,
        **audio_data.dict()
    )
    
    db.add(audio)
    db.commit()
    db.refresh(audio)
    
    return audio

# New endpoints for document QA
@router.post("/{document_id}/qa", response_model=DocumentQABase)
async def create_qa(
    qa_data: DocumentQABase,
    document_id: UUID = Path(...),
    chapter_id: Optional[UUID] = None,
    section_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentQABase:
    """
    Create a new QA pair for a document
    """
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    if chapter_id:
        chapter = db.query(DocumentChapter).filter(
            DocumentChapter.id == chapter_id,
            DocumentChapter.document_id == document_id
        ).first()
        if not chapter:
            raise HTTPException(status_code=404, detail="Chapter not found")
    
    if section_id:
        section = db.query(DocumentSection).filter(
            DocumentSection.id == section_id,
            DocumentSection.document_id == document_id
        ).first()
        if not section:
            raise HTTPException(status_code=404, detail="Section not found")
    
    qa = DocumentQA(
        document_id=document_id,
        chapter_id=chapter_id,
        section_id=section_id,
        **qa_data.dict()
    )
    
    db.add(qa)
    db.commit()
    db.refresh(qa)
    
    return qa

@router.get("/{document_id}/summary", response_model=DocumentResponse)
async def get_document_summary(
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """Get document summary"""
    logger.info(f"Getting summary for document {document_id}")
    
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        logger.error(f"Document {document_id} not found")
        raise HTTPException(status_code=404, detail="Document not found")
    
    if not document.ai_summary:
        logger.warning(f"No summary available for document {document_id}")
        raise HTTPException(status_code=404, detail="Summary not available")
    
    return document

@router.get("/{document_id}/audio", response_model=DocumentAudioBase)
async def get_document_audio(
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentAudioBase:
    """Get document audio"""
    logger.info(f"Getting audio for document {document_id}")
    
    audio = db.query(DocumentAudio).filter(
        DocumentAudio.document_id == document_id,
        DocumentAudio.status == DocumentAudioStatus.COMPLETED
    ).first()
    
    if not audio:
        logger.error(f"Audio not found for document {document_id}")
        raise HTTPException(status_code=404, detail="Audio not found")
    
    return audio 