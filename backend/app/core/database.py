from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool
from typing import Generator
from .config import settings
import logging
from urllib.parse import urlparse, parse_qs, urlencode

logger = logging.getLogger(__name__)

# Parse and clean up the database URL
if settings.DATABASE_URL:
    parsed = urlparse(settings.DATABASE_URL)
    query_params = parse_qs(parsed.query)
    
    # Remove invalid 'schemas' parameter if it exists
    if 'schemas' in query_params:
        del query_params['schemas']
    
    # Add schema to options if specified
    if settings.DB_SCHEMA:
        if 'options' not in query_params:
            query_params['options'] = []
        query_params['options'].append(f'--search_path={settings.DB_SCHEMA}')
    
    # Reconstruct the URL
    parsed = parsed._replace(query=urlencode(query_params, doseq=True))
    SQLALCHEMY_DATABASE_URL = parsed.geturl()
else:
    # Construct URL from individual components
    SQLALCHEMY_DATABASE_URL = f"postgresql://{settings.DB_USER}:{settings.DB_PASSWORD}@{settings.DB_HOST}:{settings.DB_PORT}/{settings.DB_NAME}"
    if settings.DB_SCHEMA:
        SQLALCHEMY_DATABASE_URL += f"?options=--search_path={settings.DB_SCHEMA}"

# Log the database URL (with password masked)
masked_url = SQLALCHEMY_DATABASE_URL.replace(settings.DB_PASSWORD, "****")
logger.info(f"Connecting to database with URL: {masked_url}")

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    poolclass=QueuePool,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_recycle=settings.DB_POOL_RECYCLE,
    echo=settings.DB_ECHO
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close() 