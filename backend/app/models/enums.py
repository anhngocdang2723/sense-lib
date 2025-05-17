from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    MEMBER = "member"

class PublisherStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class AuthorStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class CategoryStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class TagStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class DocumentStatus(str, Enum):
    AVAILABLE = "available"
    RESTRICTED = "restricted"
    MAINTENANCE = "maintenance"
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    ARCHIVED = "archived"

class DocumentAccessLevel(str, Enum):
    PUBLIC = "public"
    RESTRICTED = "restricted"
    PRIVATE = "private"

class DocumentAccessStatus(str, Enum):
    ACTIVE = "active"
    EXPIRED = "expired"
    REVOKED = "revoked"

class AccessLogAction(str, Enum):
    VIEW = "view"
    DOWNLOAD = "download"
    PRINT = "print"
    SHARE = "share"
    COMMENT = "comment"
    RATE = "rate"

class CommentStatus(str, Enum):
    ACTIVE = "active"
    HIDDEN = "hidden"
    DELETED = "deleted"

class StaticPageStatus(str, Enum):
    DRAFT = "draft"
    PUBLISHED = "published"
    ARCHIVED = "archived"

class ReadingProgressType(str, Enum):
    PAGE = "page"
    PERCENTAGE = "percentage"
    POSITION = "position"
    TIME = "time"
    SECTION = "section"

class ReadingProgressStatus(str, Enum):
    READING = "reading"
    COMPLETED = "completed"
    PAUSED = "paused"

class ConflictResolution(str, Enum):
    LATEST = "latest"
    MERGE = "merge"
    MANUAL = "manual"

class ConflictStatus(str, Enum):
    PENDING = "pending"
    RESOLVED = "resolved"

class VoiceGender(str, Enum):
    MALE = "male"
    FEMALE = "female"
    NEUTRAL = "neutral"

class DocumentAudioStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class FeedbackStatus(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class NotificationType(str, Enum):
    SYSTEM = "system"
    COMMENT = "comment"
    RATING = "rating"
    DOCUMENT = "document"
    ACCESS = "access"

class NotificationRelatedType(str, Enum):
    COMMENT = "comment"
    DOCUMENT = "document"
    RATING = "rating"
    ACCESS = "access"
    SYSTEM = "system"
    FEEDBACK = "feedback"

class WebsiteLinkPosition(str, Enum):
    HEADER = "header"
    FOOTER = "footer"
    SIDEBAR = "sidebar"
    MAIN_MENU = "main_menu"
    QUICK_LINKS = "quick_links"

class WebsiteLinkStatus(str, Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"

class SettingType(str, Enum):
    STRING = "string"
    INTEGER = "integer"
    BOOLEAN = "boolean"
    JSON = "json"
    ARRAY = "array"
    FLOAT = "float" 