from sqlalchemy import text
from app.core.database import engine
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def run_migration():
    """Run the SQL migration to update updated_at columns."""
    try:
        # Read the SQL file
        with open('app/core/migrations/update_updated_at.sql', 'r') as f:
            sql_commands = f.read()
        
        # Execute the SQL commands
        with engine.connect() as conn:
            logger.info("Starting migration...")
            conn.execute(text(sql_commands))
            conn.commit()
            logger.info("Migration completed successfully!")
    except Exception as e:
        logger.error(f"Error running migration: {str(e)}", exc_info=True)
        raise

if __name__ == "__main__":
    run_migration() 