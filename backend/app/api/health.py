from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from ..core.database import get_db
from ..core.qdrant_client import get_qdrant_client
from qdrant_client.http.exceptions import UnexpectedResponse

router = APIRouter()

@router.get("/health")
async def health_check(
    db: Session = Depends(get_db),
    qdrant = Depends(get_qdrant_client)
):
    """
    Health check endpoint to verify API, PostgreSQL and Qdrant Cloud status
    """
    status = {
        "status": "healthy",
        "postgresql": "connected",
        "qdrant_cloud": "connected"
    }

    # Check PostgreSQL connection
    try:
        # Test both connection and schema
        db.execute(text("SELECT current_database(), current_schema()"))
        db.execute(text("SELECT 1"))
    except Exception as e:
        status["status"] = "unhealthy"
        status["postgresql"] = "disconnected"
        status["postgresql_error"] = str(e)

    # Check Qdrant Cloud connection
    try:
        qdrant.get_collections()
    except Exception as e:
        status["status"] = "unhealthy"
        status["qdrant_cloud"] = "disconnected"
        status["qdrant_cloud_error"] = str(e)

    return status 