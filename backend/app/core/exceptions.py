from fastapi import HTTPException
from typing import Optional, Any, Dict

class BaseAPIException(HTTPException):
    """Base exception for all API errors"""
    def __init__(
        self,
        status_code: int,
        detail: str,
        error_code: str,
        data: Optional[Dict[str, Any]] = None
    ):
        super().__init__(status_code=status_code, detail=detail)
        self.error_code = error_code
        self.data = data or {}

class DocumentException(BaseAPIException):
    """Base exception for document-related errors"""
    pass

class DuplicateFileError(DocumentException):
    """Raised when attempting to upload a duplicate file"""
    def __init__(self, file_hash: str, document_id: str):
        super().__init__(
            status_code=409,
            detail="A document with this file content already exists",
            error_code="DUPLICATE_FILE",
            data={
                "file_hash": file_hash,
                "existing_document_id": document_id
            }
        )

class InvalidFileError(DocumentException):
    """Raised when file validation fails"""
    def __init__(self, detail: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="INVALID_FILE",
            data=data
        )

class FileProcessingError(DocumentException):
    """Raised when file processing fails"""
    def __init__(self, detail: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="FILE_PROCESSING_ERROR",
            data=data
        )

class VectorizationError(DocumentException):
    """Raised when document vectorization fails"""
    def __init__(self, detail: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="VECTORIZATION_ERROR",
            data=data
        )

class ValidationError(DocumentException):
    """Raised when document validation fails"""
    def __init__(self, detail: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=400,
            detail=detail,
            error_code="VALIDATION_ERROR",
            data=data
        )

class DatabaseError(DocumentException):
    """Raised when database operations fail"""
    def __init__(self, detail: str, data: Optional[Dict[str, Any]] = None):
        super().__init__(
            status_code=500,
            detail=detail,
            error_code="DATABASE_ERROR",
            data=data
        ) 