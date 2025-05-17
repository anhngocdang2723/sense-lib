import os
import logging
from datetime import datetime
from gtts import gTTS
from app.core.config import settings

# Configure logging
logger = logging.getLogger(__name__)

class AudioService:
    def __init__(self):
        logger.info("Initializing AudioService")
        self.audio_dir = os.path.join(settings.UPLOAD_DIR, "audio")
        os.makedirs(self.audio_dir, exist_ok=True)
        logger.info(f"Audio directory created at {self.audio_dir}")
        
    async def generate_audio(self, text: str, language: str = "vi", filename: str = None) -> dict:
        """
        Generate audio from text using gTTS
        
        Args:
            text: Text to convert to speech
            language: Language code (default: vi for Vietnamese)
            filename: Optional custom filename (without extension)
            
        Returns:
            Dictionary containing audio file information
        """
        try:
            logger.info(f"Generating audio for text of length {len(text)} in language {language}")
            
            # Validate input
            if not text or not text.strip():
                raise ValueError("Text cannot be empty")
            
            if not language or not language.strip():
                raise ValueError("Language code cannot be empty")
            
            # Generate filename
            if filename:
                # Use provided filename
                safe_filename = f"{filename}.mp3"
            else:
                # Generate timestamp-based filename
                timestamp = int(datetime.now().timestamp())
                safe_filename = f"summary_{timestamp}.mp3"
            
            file_path = os.path.join(self.audio_dir, safe_filename)
            
            # Generate audio using gTTS
            tts = gTTS(text=text, lang=language, slow=False)
            tts.save(file_path)
            
            # Verify file was created
            if not os.path.exists(file_path):
                raise FileNotFoundError(f"Audio file was not created at {file_path}")
            
            # Get file size
            file_size = os.path.getsize(file_path)
            if file_size == 0:
                raise ValueError("Generated audio file is empty")
            
            # Calculate duration (approximate)
            # Average speaking rate: 150 words per minute
            word_count = len(text.split())
            duration_seconds = int((word_count / 150) * 60)
            
            logger.info(f"Audio generated successfully: {safe_filename}")
            logger.info(f"File size: {file_size} bytes, Duration: {duration_seconds} seconds")
            
            return {
                "file_url": f"/audio/{safe_filename}",
                "duration_seconds": duration_seconds,
                "file_size": file_size
            }
            
        except Exception as e:
            logger.error(f"Error generating audio: {str(e)}")
            # Clean up file if it exists
            if 'file_path' in locals() and os.path.exists(file_path):
                try:
                    os.remove(file_path)
                except Exception as cleanup_error:
                    logger.error(f"Error cleaning up audio file: {str(cleanup_error)}")
            raise 