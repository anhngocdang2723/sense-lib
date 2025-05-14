from sqlalchemy import Column, String, Text, Integer, DateTime, Enum as SQLEnum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import WebsiteLinkPosition, WebsiteLinkStatus

class WebsiteLink(BaseModel):
    __tablename__ = "website_links"

    title = Column(String, nullable=False)
    url = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    position = Column(SQLEnum(WebsiteLinkPosition), nullable=False)
    display_order = Column(Integer, default=0)
    status = Column(SQLEnum(WebsiteLinkStatus), default=WebsiteLinkStatus.ACTIVE)

    __table_args__ = (
        CheckConstraint('display_order >= 0', name='check_display_order'),
        CheckConstraint("url ~ '^https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$'", name='check_url_format'),
    ) 