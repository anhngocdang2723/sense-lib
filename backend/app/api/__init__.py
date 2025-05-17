from fastapi import APIRouter
from .documents import router as documents_router
from .sessions import router as sessions_router
from .auth import router as auth_router
from .users import router as users_router
from .categories import router as categories_router
from .tags import router as tags_router
from .authors import router as authors_router
from .languages import router as languages_router
from .search import router as search_router
from .access import router as access_router
from .health import router as health_router
from .publishers import router as publishers_router

# Define router configurations
ROUTER_CONFIGS = {
    "auth": {"prefix": "/auth", "tags": ["auth"]},
    "users": {"prefix": "/users", "tags": ["users"]},
    "documents": {"prefix": "/documents", "tags": ["documents"]},
    "categories": {"prefix": "/categories", "tags": ["categories"]},
    "tags": {"prefix": "/tags", "tags": ["tags"]},
    "authors": {"prefix": "/authors", "tags": ["authors"]},
    "languages": {"prefix": "/languages", "tags": ["languages"]},
    "search": {"prefix": "/search", "tags": ["search"]},
    "access": {"prefix": "/access", "tags": ["access"]},
    "health": {"prefix": "/health", "tags": ["health"]},
    "sessions": {"prefix": "/sessions", "tags": ["sessions"]},
    "publishers": {"prefix": "/publishers", "tags": ["publishers"]}
}

router = APIRouter()

# Include all routers with their configurations
router.include_router(auth_router, **ROUTER_CONFIGS["auth"])
router.include_router(users_router, **ROUTER_CONFIGS["users"])
router.include_router(documents_router, **ROUTER_CONFIGS["documents"])
router.include_router(categories_router, **ROUTER_CONFIGS["categories"])
router.include_router(tags_router, **ROUTER_CONFIGS["tags"])
router.include_router(authors_router, **ROUTER_CONFIGS["authors"])
router.include_router(languages_router, **ROUTER_CONFIGS["languages"])
router.include_router(search_router, **ROUTER_CONFIGS["search"])
router.include_router(access_router, **ROUTER_CONFIGS["access"])
router.include_router(health_router, **ROUTER_CONFIGS["health"])
router.include_router(sessions_router, **ROUTER_CONFIGS["sessions"])
router.include_router(publishers_router, **ROUTER_CONFIGS["publishers"])