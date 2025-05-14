from fastapi import APIRouter

router = APIRouter()

# Import and include all API routers
from . import auth, health, documents, users, access, search, categories, tags, authors

# Include all routers
router.include_router(health.router)
router.include_router(auth.router)
router.include_router(users.router)
router.include_router(documents.router)
router.include_router(search.router)
router.include_router(access.router)
router.include_router(categories.router, prefix="/categories", tags=["categories"])
router.include_router(tags.router, prefix="/tags", tags=["tags"])
router.include_router(authors.router, prefix="/authors", tags=["authors"])