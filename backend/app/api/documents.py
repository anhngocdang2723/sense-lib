from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query, Path, BackgroundTasks, Form
from typing import List, Any, Optional
from uuid import UUID
from datetime import datetime
import os
import hashlib
import logging
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, joinedload
import json

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
    DocumentAudioStatus, ReadingProgressType, ReadingProgressStatus, Tag, Author
)
from app.schemas.document import (
    DocumentCreate, DocumentUpdate, DocumentResponse, DocumentList,
    DocumentChapterBase, DocumentSectionBase, DocumentAudioBase, DocumentQABase
)
from app.services.document import DocumentService
# Comment out vector store import
# from app.services.vector import VectorStore
from app.schemas.author import AuthorResponse
from app.schemas.tag import TagResponse

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
    authors: Optional[str] = Form(None),  # JSON string of author IDs
    tags: Optional[str] = Form(None),     # JSON string of tag IDs
    file: UploadFile = File(...),
    image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a new document"""
    logger.info(f"Starting document upload process for file: {file.filename}")
    logger.info(f"Upload parameters - Title: {title}, Category: {category_id}, Language: {language}")
    
    try:
        # Parse authors and tags from JSON strings
        author_ids = None
        tag_ids = None
        if authors:
            try:
                author_ids = json.loads(authors)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid authors format")
        if tags:
            try:
                tag_ids = json.loads(tags)
            except json.JSONDecodeError:
                raise HTTPException(status_code=400, detail="Invalid tags format")

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
            version=version,
            author_ids=author_ids,
            tag_ids=tag_ids
        )
        logger.info("DocumentCreate instance created successfully")
        
        # Process and save document using service
        logger.info("Starting document processing and saving")
        document = await DocumentService.process_and_save_document(
            db=db,
            data=document_data,
            file=file,
            image=image,
            current_user=current_user
        )
        logger.info(f"Document processed and saved successfully with ID: {document.id}")
        
        # Refresh document to ensure all relationships are loaded
        logger.info("Refreshing document to load relationships")
        db.refresh(document)
        logger.info("Document refresh completed")
        
        return DocumentResponse(
            **document.__dict__,
            authors=[AuthorResponse.from_orm(a) for a in getattr(document, 'authors', [])],
            tags=[TagResponse.from_orm(t) for t in getattr(document, 'tags', [])],
        )
        
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
        logger.info("Starting document list query")
        
        # Build base query with joins
        query = db.query(Document).options(
            joinedload(Document.category),
            joinedload(Document.publisher),
            joinedload(Document.file_type_rel),
            joinedload(Document.language_rel),
            joinedload(Document.added_by_user),
        )
        
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
            search_filter = (
                (Document.title.ilike(f"%{search}%")) |
                (Document.description.ilike(f"%{search}%"))
            )
            query = query.filter(search_filter)
        
        # Get total count
        total = query.count()
        logger.info(f"Total documents found: {total}")
        
        # Apply pagination
        documents = query.offset(skip).limit(limit).all()
        logger.info(f"Retrieved {len(documents)} documents")
        
        return DocumentList(
            total=total,
            skip=skip,
            limit=limit,
            documents=[
                DocumentResponse(
                    **doc.__dict__,
                    authors=[AuthorResponse.from_orm(a) for a in getattr(doc, 'authors', [])],
                    tags=[TagResponse.from_orm(t) for t in getattr(doc, 'tags', [])],
                ) for doc in documents
            ]
        )
    except Exception as e:
        logger.error(f"Error in list_documents: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to retrieve documents: {str(e)}"
        )

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
    
    return DocumentResponse(
        **document.__dict__,
        authors=[AuthorResponse.from_orm(a) for a in getattr(document, 'authors', [])],
        tags=[TagResponse.from_orm(t) for t in getattr(document, 'tags', [])],
    )

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_data: DocumentUpdate,
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """
    Update document metadata, including authors and tags
    """
    print(f"[DEBUG] Received update data for document {document_id}: {document_data.dict()}")
    document = db.query(Document).filter(Document.id == document_id).first()
    if not document:
        raise HTTPException(
            status_code=404,
            detail="Document not found"
        )

    update_data = document_data.dict(exclude_unset=True)
    print(f"[DEBUG] Update fields for document {document_id}: {update_data}")
    for field, value in update_data.items():
        if field == 'tag_ids' and value is not None:
            document.tags.clear()
            for tag_id in value:
                tag = db.query(Tag).filter(Tag.id == tag_id).first()
                if tag:
                    document.tags.append(tag)
        elif field == 'author_ids' and value is not None:
            document.authors.clear()
            for author_id in value:
                author = db.query(Author).filter(Author.id == author_id).first()
                if author:
                    document.authors.append(author)
        else:
            setattr(document, field, value)

    document.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(document)

    return DocumentResponse(
        **document.__dict__,
        authors=[AuthorResponse.from_orm(a) for a in getattr(document, 'authors', [])],
        tags=[TagResponse.from_orm(t) for t in getattr(document, 'tags', [])],
    )

@router.delete("/{document_id}")
async def delete_document(
    document_id: UUID = Path(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> dict:
    """
    Delete a document (admin only)
    - If document is active and has related records (comments, ratings, etc): set status to archived
    - If document is archived and has no related records: delete permanently
    - If document is active and has no related records: delete permanently
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
    
    # Check if document has any related records
    has_comments = db.query(Document).join(Document.comments).filter(Document.id == document_id).first() is not None
    has_ratings = db.query(Document).join(Document.ratings).filter(Document.id == document_id).first() is not None
    has_favorites = db.query(Document).join(Document.favorites).filter(Document.id == document_id).first() is not None
    has_access_records = db.query(Document).join(Document.access_records).filter(Document.id == document_id).first() is not None
    has_reading_progress = db.query(Document).join(Document.reading_progress).filter(Document.id == document_id).first() is not None
    
    has_related_records = any([has_comments, has_ratings, has_favorites, has_access_records, has_reading_progress])
    
    if has_related_records:
        if document.status != DocumentStatus.ARCHIVED:
            # Soft delete: set status to archived
            document.status = DocumentStatus.ARCHIVED
            db.commit()
            return {
                "message": "Document is in use and has been archived",
                "status": "archived"
            }
        else:
            raise HTTPException(
                status_code=400,
                detail="Cannot delete document. It is archived but still has related records."
            )
    else:
        # No related records, safe to delete
        # Delete file
        file_path = os.path.join(settings.UPLOAD_DIR, document.file_name)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.delete(document)
        db.commit()
        return {
            "message": "Document has been permanently deleted",
            "status": "deleted"
        }

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