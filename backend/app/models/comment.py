from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum as SQLEnum, ForeignKey, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import backref
from .base import BaseModel
from .enums import CommentStatus

class Comment(BaseModel):
    __tablename__ = "comments"

    document_id = Column(UUID(as_uuid=True), ForeignKey("documents.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    parent_id = Column(UUID(as_uuid=True), ForeignKey("comments.id"), nullable=True)
    content = Column(Text, nullable=False)
    status = Column(SQLEnum(CommentStatus), default=CommentStatus.ACTIVE)
    is_edited = Column(Boolean, default=False)

    # Relationships
    user = relationship("User", back_populates="comments")
    document = relationship("Document", back_populates="comments")
    parent = relationship(
    "Comment",
    remote_side="Comment.id",
    backref=backref("replies", lazy="dynamic")
    )

    __table_args__ = (
        CheckConstraint('length(content) > 0', name='check_comment_content'),
    ) 