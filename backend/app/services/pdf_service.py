import os
import logging
from typing import Optional, Tuple
from pdf2image import convert_from_path
from PIL import Image
import tempfile

logger = logging.getLogger(__name__)

class PDFService:
    """Service for handling PDF operations including cover extraction"""
    
    @staticmethod
    def extract_cover_image(pdf_path: str, output_dir: str, filename: str) -> Optional[str]:
        """
        Extract the first page of a PDF as a cover image
        
        Args:
            pdf_path: Path to the PDF file
            output_dir: Directory to save the cover image
            filename: Base filename for the cover image
            
        Returns:
            Optional[str]: URL path to the saved cover image if successful, None otherwise
        """
        try:
            logger.info(f"Extracting cover image from PDF: {pdf_path}")
            
            # Create output directory if it doesn't exist
            os.makedirs(output_dir, exist_ok=True)
            
            # Convert first page to image
            images = convert_from_path(
                pdf_path,
                first_page=1,
                last_page=1,
                dpi=300  # Higher DPI for better quality
            )
            
            if not images:
                logger.error("No pages found in PDF")
                return None
            
            # Get the first page image
            cover_image = images[0]
            
            # Save as JPEG with good quality
            output_path = os.path.join(output_dir, f"{filename}_cover.jpg")
            cover_image.save(output_path, "JPEG", quality=95)
            
            # Generate URL path
            url_path = f"/uploads/images/{filename}_cover.jpg"
            
            logger.info(f"Cover image extracted and saved to: {output_path}")
            return url_path
            
        except Exception as e:
            logger.error(f"Error extracting cover image: {str(e)}")
            return None
    
    @staticmethod
    def get_pdf_metadata(pdf_path: str) -> Tuple[int, int, int]:
        """
        Get PDF metadata including number of pages and dimensions
        
        Args:
            pdf_path: Path to the PDF file
            
        Returns:
            Tuple[int, int, int]: (number of pages, width, height)
        """
        try:
            # Convert first page to get dimensions
            images = convert_from_path(pdf_path, first_page=1, last_page=1)
            if not images:
                return 0, 0, 0
                
            # Get dimensions from first page
            width, height = images[0].size
            
            # Get total pages
            from PyPDF2 import PdfReader
            reader = PdfReader(pdf_path)
            num_pages = len(reader.pages)
            
            return num_pages, width, height
            
        except Exception as e:
            logger.error(f"Error getting PDF metadata: {str(e)}")
            return 0, 0, 0 