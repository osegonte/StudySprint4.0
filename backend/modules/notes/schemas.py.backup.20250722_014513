# backend/modules/notes/schemas.py
"""
StudySprint 4.0 - Notes Module Schemas
Minimal schemas for basic functionality
"""

from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from uuid import UUID
from enum import Enum


class NoteType(str, Enum):
    GENERAL = "general"
    SUMMARY = "summary"
    QUESTION = "question"
    IDEA = "idea"


class NoteCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    content: Optional[str] = None
    note_type: NoteType = NoteType.GENERAL
    pdf_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None


class NoteResponse(BaseModel):
    id: UUID
    title: str
    content: Optional[str] = None
    note_type: str
    pdf_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class HighlightCreate(BaseModel):
    pdf_id: UUID
    page_number: int
    selected_text: Optional[str] = None
    color: str = "#ffff00"


class HighlightResponse(BaseModel):
    id: UUID
    pdf_id: UUID
    page_number: int
    selected_text: Optional[str] = None
    color: str
    created_at: datetime

    class Config:
        from_attributes = True
