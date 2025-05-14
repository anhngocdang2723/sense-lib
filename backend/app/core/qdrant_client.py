from qdrant_client import QdrantClient
from qdrant_client.http import models
from ..core.config import settings

def get_qdrant_client():
    """
    Get Qdrant Cloud client instance
    """
    if not settings.QDRANT_URL or not settings.QDRANT_API_KEY:
        raise ValueError("QDRANT_URL and QDRANT_API_KEY must be set in environment variables")
    
    return QdrantClient(
        url=settings.QDRANT_URL,
        api_key=settings.QDRANT_API_KEY
    ) 