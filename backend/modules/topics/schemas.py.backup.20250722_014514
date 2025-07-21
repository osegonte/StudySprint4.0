# backend/modules/topics/schemas.py
"""
StudySprint 4.0 - Topics Module Schemas
Pydantic schemas for topic API validation - Compatible with Pydantic v2
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TopicBase(BaseModel):
    """Base schema for Topic"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field("#3498db", pattern="^#[0-9A-Fa-f]{6}$")  # Changed from regex to pattern
    icon: str = Field("book", max_length=50)
    difficulty_level: int = Field(1, ge=1, le=5)
    priority_level: int = Field(1, ge=1, le=5)
    
    @field_validator('name')  # Changed from @validator to @field_validator
    @classmethod
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Topic name cannot be empty')
        return v.strip()


class TopicCreate(TopicBase):
    """Schema for creating a new topic"""
    pass


class TopicUpdate(BaseModel):
    """Schema for updating topic"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, pattern="^#[0-9A-Fa-f]{6}$")  # Changed from regex to pattern
    icon: Optional[str] = Field(None, max_length=50)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    priority_level: Optional[int] = Field(None, ge=1, le=5)
    is_archived: Optional[bool] = None
    
    @field_validator('name')  # Changed from @validator to @field_validator
    @classmethod
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Topic name cannot be empty')
        return v.strip() if v else v


class TopicResponse(TopicBase):
    """Schema for topic response"""
    id: UUID
    total_pdfs: int = 0
    total_exercises: int = 0
    study_progress: float = 0.0
    estimated_completion_hours: int = 0
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicWithStats(TopicResponse):
    """Schema for topic with detailed statistics"""
    completed_pdfs: int = 0
    total_pages: int = 0
    pages_read: int = 0
    total_study_time_minutes: int = 0
    last_studied: Optional[datetime] = None
    completion_percentage: float = 0.0


class TopicList(BaseModel):
    """Schema for topic list response"""
    topics: List[TopicResponse]
    total: int
    archived_count: int = 0