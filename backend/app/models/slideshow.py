from sqlalchemy import Column, String, Text, Integer, DateTime, Enum as SQLEnum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import CategoryStatus

class Slideshow(BaseModel):
    __tablename__ = "slideshows"

    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=False)
    link_url = Column(String, nullable=True)
    display_order = Column(Integer, default=0)
    status = Column(SQLEnum(CategoryStatus), default=CategoryStatus.ACTIVE)

    __table_args__ = (
        CheckConstraint('display_order >= 0', name='check_display_order'),
    ) 