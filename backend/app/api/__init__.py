from fastapi import APIRouter
from . import (
    auth,
    users,
    documents,
    categories,
    tags,
    languages,
    authors,
    publishers,
    favorites,
    sessions,
    access,
    health,
    search,
    ratings,
    comments
)

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
    "publishers": {"prefix": "/publishers", "tags": ["publishers"]},
    "ratings": {"prefix": "/ratings", "tags": ["ratings"]},
    "comments": {"prefix": "/comments", "tags": ["comments"]}
}

router = APIRouter()

# Include all routers with their configurations
router.include_router(auth.router, **ROUTER_CONFIGS["auth"])
router.include_router(users.router, **ROUTER_CONFIGS["users"])
router.include_router(documents.router, **ROUTER_CONFIGS["documents"])
router.include_router(categories.router, **ROUTER_CONFIGS["categories"])
router.include_router(tags.router, **ROUTER_CONFIGS["tags"])
router.include_router(languages.router, **ROUTER_CONFIGS["languages"])
router.include_router(authors.router, **ROUTER_CONFIGS["authors"])
router.include_router(publishers.router, **ROUTER_CONFIGS["publishers"])
router.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
router.include_router(sessions.router, **ROUTER_CONFIGS["sessions"])
router.include_router(access.router, **ROUTER_CONFIGS["access"])
router.include_router(health.router, **ROUTER_CONFIGS["health"])
router.include_router(search.router, **ROUTER_CONFIGS["search"])
router.include_router(ratings.router, **ROUTER_CONFIGS["ratings"])
router.include_router(comments.router, **ROUTER_CONFIGS["comments"])