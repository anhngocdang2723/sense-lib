from sqlalchemy import text
from app.core.database import engine, Base
from app.models import *  # This will import all models
from .create_enums import create_enums
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def init_db():
    """Initialize the database by creating all tables."""
    try:
        # Create extensions if they don't exist
        with engine.connect() as conn:
            logger.info("Creating extensions...")
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\""))
            conn.execute(text("CREATE EXTENSION IF NOT EXISTS \"pgcrypto\""))
            conn.commit()
        
        # Create enum types first
        logger.info("Creating enum types...")
        create_enums()
        
        # Create all tables
        logger.info("Creating tables...")
        logger.info(f"Models to create: {[model.__tablename__ for model in Base.__subclasses__() if hasattr(model, '__tablename__')]}")
        Base.metadata.create_all(bind=engine)
            
        logger.info("Database initialized successfully!")
    except Exception as e:
        logger.error(f"Error initializing database: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    init_db() 