from sqlalchemy.orm import Session
import re
import unicodedata
from typing import Type, TypeVar, Optional

T = TypeVar('T')

class SlugService:
    @staticmethod
    def convert_to_slug(text: str) -> str:
        """Convert text to URL-friendly slug"""
        text = unicodedata.normalize('NFKD', text.lower())
        text = re.sub(r'[^a-z0-9\s-]', '', text)
        text = re.sub(r'[\s-]+', '-', text)
        return text.strip('-')

    @staticmethod
    def generate_unique_slug(
        db: Session,
        model_class: Type[T],
        base_slug: str,
        exclude_id: Optional[str] = None
    ) -> str:
        """Generate a unique slug by appending a number if the base slug exists"""
        slug = base_slug
        counter = 1
        
        # Build query to check for existing slug
        query = db.query(model_class).filter(model_class.slug == slug)
        if exclude_id:
            query = query.filter(model_class.id != exclude_id)
            
        while query.first() is not None:
            slug = f"{base_slug}-{counter}"
            counter += 1
            query = db.query(model_class).filter(model_class.slug == slug)
            if exclude_id:
                query = query.filter(model_class.id != exclude_id)
                
        return slug 