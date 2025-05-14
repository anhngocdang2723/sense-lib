from sqlalchemy import Column, String, Text, DateTime, Enum as SQLEnum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID
from .base import BaseModel
from .enums import SettingType

class SystemSetting(BaseModel):
    __tablename__ = "system_settings"

    key = Column(String, unique=True, nullable=False)
    value = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(SettingType), default=SettingType.STRING)

    __table_args__ = (
        CheckConstraint('length(key) > 0', name='check_setting_key'),
        CheckConstraint('length(value) > 0', name='check_setting_value'),
    ) 