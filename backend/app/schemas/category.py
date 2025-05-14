from pydantic import BaseModel, Field, validator, UUID4
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from ..models.enums import CategoryStatus

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=2)
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None
    icon: Optional[str] = None
    status: Optional[CategoryStatus] = CategoryStatus.ACTIVE

class CategoryCreate(CategoryBase):
    slug: Optional[str] = None

class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2)
    description: Optional[str] = None
    parent_id: Optional[UUID4] = None
    icon: Optional[str] = None
    status: Optional[CategoryStatus] = None

class CategoryInDB(CategoryBase):
    id: UUID
    slug: str
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CategoryResponse(CategoryInDB):
    children: List['CategoryResponse'] = []

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Create a separate schema for nested children to limit recursion
class CategoryNested(CategoryInDB):
    children: List['CategoryNested'] = []

    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Create a flat schema without children for list responses
class CategoryFlat(CategoryInDB):
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: v.isoformat()
        }

# Fix circular reference
CategoryResponse.model_rebuild()
CategoryNested.model_rebuild() 