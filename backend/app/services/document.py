import os
import logging
import hashlib
from datetime import datetime
from typing import List, Dict, Any, Tuple, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter
import re

# Configure logging
logger = logging.getLogger(__name__)

class DocumentProcessor:
    """
    Handles text document processing including:
    - Text extraction
    - Document chunking with configurable overlap
    - Metadata extraction and management
    """
    
    SUPPORTED_EXTENSIONS = {
        'text': ['txt'],
    }
    
    def __init__(
        self,
        chunk_size: int = 512,
        chunk_overlap: int = 200,
        upload_dir: str = "data/uploads",
    ):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        self.upload_dir = upload_dir
        
        # Create upload directory if it doesn't exist
        os.makedirs(self.upload_dir, exist_ok=True)
        
        # Initialize text splitter
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.chunk_size,
            chunk_overlap=self.chunk_overlap,
            length_function=len,
            is_separator_regex=False
        )
    
    def process_file(self, file_path: str) -> Tuple[List[str], List[Dict[str, Any]]]:
        """
        Process a text file and return its chunks and associated metadata.
        
        Args:
            file_path: Path to the file to process
            
        Returns:
            Tuple containing:
                - List of text chunks
                - List of metadata dictionaries for each chunk
        """
        try:
            # Extract file extension
            file_ext = os.path.splitext(file_path)[1].lower().replace('.', '')
            
            # Validate file type
            if not self._is_supported_file_type(file_ext):
                logger.error(f"Unsupported file type: {file_ext}")
                return [], []
            
            # Generate file hash for identification
            file_hash = self._generate_file_hash(file_path)
            
            # Extract basic metadata
            base_metadata = self._extract_metadata(file_path, file_ext)
            base_metadata["file_hash"] = file_hash
            
            # Extract text content
            text = self._extract_text(file_path)
            
            # Split text into chunks
            chunks = self.text_splitter.split_text(text)
            
            # Create metadata for each chunk
            metadata_list = []
            for i, chunk in enumerate(chunks):
                chunk_metadata = base_metadata.copy()
                chunk_metadata.update({
                    "content_type": "text",
                    "chunk_id": i,
                    "total_chunks": len(chunks)
                })
                metadata_list.append(chunk_metadata)
            
            logger.info(f"Processed {file_path} into {len(chunks)} chunks")
            return chunks, metadata_list
            
        except Exception as e:
            logger.error(f"Error processing file {file_path}: {str(e)}")
            return [], []
    
    def _extract_text(self, file_path: str) -> str:
        """Extract text from a file."""
        try:
            with open(file_path, 'r', encoding='utf-8') as file:
                text = file.read()
            return self._clean_text(text)
        except UnicodeDecodeError:
            # Try with different encoding if utf-8 fails
            with open(file_path, 'r', encoding='latin-1') as file:
                text = file.read()
            return self._clean_text(text)
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {str(e)}")
            return ""
    
    def _clean_text(self, text: str) -> str:
        """Clean and normalize extracted text."""
        if not text:
            return ""
        
        # Replace multiple newlines with double newline
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        # Replace multiple spaces with single space
        text = re.sub(r' {2,}', ' ', text)
        
        # Remove non-printable characters
        text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
        
        return text.strip()
    
    def _is_supported_file_type(self, file_ext: str) -> bool:
        """Check if the file extension is supported."""
        return file_ext in self.SUPPORTED_EXTENSIONS['text']
    
    def _generate_file_hash(self, file_path: str) -> str:
        """Generate a hash for the file to use as a unique identifier."""
        try:
            hasher = hashlib.md5()
            with open(file_path, 'rb') as file:
                # Read file in chunks to handle large files
                for chunk in iter(lambda: file.read(4096), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.error(f"Error generating file hash: {str(e)}")
            # Return a timestamp-based fallback hash
            return f"hash_{int(datetime.now().timestamp())}"
    
    def _extract_metadata(self, file_path: str, file_ext: str) -> Dict[str, Any]:
        """Extract metadata from the file."""
        try:
            file_name = os.path.basename(file_path)
            file_size = os.path.getsize(file_path)
            creation_time = os.path.getctime(file_path)
            modification_time = os.path.getmtime(file_path)
            
            metadata = {
                "file_name": file_name,
                "file_type": file_ext,
                "file_size": file_size,
                "creation_date": datetime.fromtimestamp(creation_time).isoformat(),
                "modification_date": datetime.fromtimestamp(modification_time).isoformat(),
                "source_path": file_path,
                "document_type": "text"
            }
            
            return metadata
        except Exception as e:
            logger.error(f"Error extracting metadata: {str(e)}")
            return {
                "file_name": os.path.basename(file_path),
                "file_type": file_ext,
                "error": str(e)
            } 