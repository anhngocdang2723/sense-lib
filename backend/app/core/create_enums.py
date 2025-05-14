from sqlalchemy import text
from .database import engine
from ..models.enums import *
import logging

logger = logging.getLogger(__name__)

def create_enums():
    """Create all enum types in PostgreSQL."""
    enums = {
        'user_role': UserRole,
        'publisher_status': PublisherStatus,
        'author_status': AuthorStatus,
        'category_status': CategoryStatus,
        'tag_status': TagStatus,
        'document_status': DocumentStatus,
        'document_access_level': DocumentAccessLevel,
        'document_access_status': DocumentAccessStatus,
        'access_log_action': AccessLogAction,
        'comment_status': CommentStatus,
        'static_page_status': StaticPageStatus,
        'reading_progress_type': ReadingProgressType,
        'reading_progress_status': ReadingProgressStatus,
        'conflict_resolution': ConflictResolution,
        'conflict_status': ConflictStatus,
        'voice_gender': VoiceGender,
        'document_audio_status': DocumentAudioStatus,
        'feedback_status': FeedbackStatus,
        'notification_type': NotificationType,
        'notification_related_type': NotificationRelatedType,
        'website_link_position': WebsiteLinkPosition,
        'website_link_status': WebsiteLinkStatus,
        'setting_type': SettingType
    }

    try:
        with engine.connect() as conn:
            for enum_name, enum_class in enums.items():
                # Log the enum values before creation
                logger.info(f"Creating enum {enum_name} with values: {[value.value for value in enum_class]}")
                
                # Drop enum if exists
                conn.execute(text(f"DROP TYPE IF EXISTS {enum_name} CASCADE"))
                
                # Create enum with explicit values
                values = [f"'{value.value}'" for value in enum_class]
                create_enum_sql = f"CREATE TYPE {enum_name} AS ENUM ({', '.join(values)})"
                logger.info(f"Executing SQL: {create_enum_sql}")
                conn.execute(text(create_enum_sql))
                
                # Verify the enum was created correctly
                result = conn.execute(text(f"SELECT enum_range(NULL::{enum_name})"))
                created_values = result.scalar()
                logger.info(f"Created enum {enum_name} with values: {created_values}")
            
            conn.commit()
            print("All enum types created successfully!")
    except Exception as e:
        logger.error(f"Error creating enum types: {e}", exc_info=True)
        raise

if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    create_enums() 