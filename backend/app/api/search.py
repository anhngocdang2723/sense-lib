from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Any, Optional
from sqlalchemy.orm import Session
from ..core.database import get_db
from ..core.config import settings
from ..auth.jwt import get_current_user
from ..services.vector import VectorStore
from ..models import Document

router = APIRouter(prefix="/search", tags=["search"])

@router.get("/semantic")
async def semantic_search(
    query: str = Query(..., min_length=3),
    limit: int = Query(10, ge=1, le=50),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Perform semantic search on documents
    """
    try:
        vector_store = VectorStore(
            qdrant_url=settings.QDRANT_URL,
            qdrant_api_key=settings.QDRANT_API_KEY
        )
        
        # Perform semantic search
        results = vector_store.search(query, limit=limit)
        
        # Get document details for results
        document_ids = [result["document_id"] for result in results]
        documents = db.query(Document).filter(Document.id.in_(document_ids)).all()
        
        # Combine search results with document details
        search_results = []
        for result in results:
            document = next((doc for doc in documents if doc.id == result["document_id"]), None)
            if document:
                search_results.append({
                    "document": document,
                    "score": result["score"],
                    "snippet": result.get("snippet", "")
                })
        
        return {
            "query": query,
            "results": search_results
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/keyword")
async def keyword_search(
    query: str = Query(..., min_length=3),
    category: Optional[str] = None,
    author: Optional[str] = None,
    year: Optional[int] = None,
    limit: int = Query(10, ge=1, le=50),
    skip: int = Query(0, ge=0),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Perform keyword-based search on documents
    """
    try:
        # Build search query
        search_query = db.query(Document).filter(
            (Document.title.ilike(f"%{query}%")) |
            (Document.author.ilike(f"%{query}%")) |
            (Document.description.ilike(f"%{query}%")) |
            (Document.tags.ilike(f"%{query}%"))
        )
        
        # Apply filters
        if category:
            search_query = search_query.filter(Document.category == category)
        if author:
            search_query = search_query.filter(Document.author == author)
        if year:
            search_query = search_query.filter(Document.publication_year == year)
        
        # Get total count
        total = search_query.count()
        
        # Apply pagination
        documents = search_query.offset(skip).limit(limit).all()
        
        return {
            "query": query,
            "total": total,
            "skip": skip,
            "limit": limit,
            "results": documents
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@router.get("/suggest")
async def search_suggestions(
    query: str = Query(..., min_length=2),
    limit: int = Query(5, ge=1, le=10),
    current_user: Any = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get search suggestions based on partial query
    """
    try:
        # Search in titles and authors
        suggestions = db.query(Document.title, Document.author).filter(
            (Document.title.ilike(f"%{query}%")) |
            (Document.author.ilike(f"%{query}%"))
        ).limit(limit).all()
        
        # Format suggestions
        formatted_suggestions = []
        for title, author in suggestions:
            if query.lower() in title.lower():
                formatted_suggestions.append(title)
            if query.lower() in author.lower():
                formatted_suggestions.append(author)
        
        # Remove duplicates and limit results
        formatted_suggestions = list(dict.fromkeys(formatted_suggestions))[:limit]
        
        return {
            "query": query,
            "suggestions": formatted_suggestions
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        ) 