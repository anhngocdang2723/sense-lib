import logging
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.models import Document, DocumentStatus
from app.core.config import settings
import os

logger = logging.getLogger(__name__)

def cleanup_expired_documents():
    """Clean up documents that have expired and are still pending"""
    logger.info("Starting cleanup of expired documents")
    
    try:
        db = SessionLocal()
        
        # Find expired documents that are still pending
        expired_documents = db.query(Document).filter(
            Document.expires_at < datetime.utcnow(),
            Document.status == DocumentStatus.PENDING
        ).all()
        
        for document in expired_documents:
            try:
                # Delete the file
                file_path = os.path.join(settings.UPLOAD_DIR, document.file_name)
                if os.path.exists(file_path):
                    os.remove(file_path)
                    logger.info(f"Deleted file: {file_path}")
                
                # Delete the document record
                db.delete(document)
                logger.info(f"Deleted expired document: {document.id}")
                
            except Exception as e:
                logger.error(f"Error deleting document {document.id}: {str(e)}")
                continue
        
        db.commit()
        logger.info(f"Cleanup completed. Deleted {len(expired_documents)} expired documents")
        
    except Exception as e:
        logger.error(f"Error in document cleanup: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_expired_documents() 