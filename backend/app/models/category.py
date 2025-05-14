from sqlalchemy import Column, String, Text, Enum as SQLEnum, ForeignKey, CheckConstraint, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import CategoryStatus

class Category(BaseModel):
    __tablename__ = "categories"

    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("categories.id"), nullable=True)
    slug = Column(String, unique=True, index=True)
    icon = Column(String, nullable=True)
    status = Column(SQLEnum(CategoryStatus), default=CategoryStatus.ACTIVE)

    # Relationships
    documents = relationship("Document", back_populates="category")

    __table_args__ = (
        CheckConstraint('length(name) >= 2', name='check_category_name'),
    )

# Define parent relationship after class definition
Category.parent = relationship(
    "Category",
    foreign_keys=[Category.parent_id],
    remote_side=[Category.id],  # Explicitly use Category.id
    backref="children"
)