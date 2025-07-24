# backend/modules/topics/schemas.py - Week 1 Simplified
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from uuid import UUID

class TopicBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field("#3498db")
    icon: str = Field("book")
    difficulty_level: int = Field(1, ge=1, le=5)
    priority_level: int = Field(1, ge=1, le=5)

class TopicCreate(TopicBase):
    pass

class TopicResponse(TopicBase):
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
