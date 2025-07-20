# backend/modules/pdfs/schemas.py
"""
StudySprint 4.0 - PDF Module Schemas
Pydantic schemas for API request/response validation - Compatible with Pydantic v2
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class PDFType(str, Enum):
    STUDY = "study"
    EXERCISE = "exercise"
    REFERENCE = "reference"


class UploadStatus(str, Enum):
    PENDING = "pending"
    UPLOADING = "uploading"
    COMPLETED = "completed"
    FAILED = "failed"


class ProcessingStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class PDFBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    pdf_type: PDFType = PDFType.STUDY
    difficulty_level: int = Field(1, ge=1, le=5)
    topic_id: Optional[UUID] = None
    parent_pdf_id: Optional[UUID] = None


class PDFCreate(PDFBase):
    """Schema for creating a new PDF"""
    pass


class PDFUpdate(BaseModel):
    """Schema for updating PDF metadata"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    pdf_type: Optional[PDFType] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    topic_id: Optional[UUID] = None
    current_page: Optional[int] = Field(None, ge=1)
    
    @field_validator('current_page')  # Changed from @validator to @field_validator
    @classmethod
    def validate_current_page(cls, v):
        if v is not None and v < 1:
            raise ValueError('Current page must be at least 1')
        return v


class PDFResponse(PDFBase):
    """Schema for PDF response"""
    id: UUID
    file_name: str
    file_path: str
    file_size: Optional[int] = None
    total_pages: int = 0
    current_page: int = 1
    last_read_page: int = 1
    reading_progress: float = 0.0
    estimated_read_time_minutes: int = 0
    actual_read_time_minutes: int = 0
    is_completed: bool = False
    completion_date: Optional[datetime] = None
    upload_status: UploadStatus
    processing_status: ProcessingStatus
    content_hash: Optional[str] = None
    language: str = "en"
    author: Optional[str] = None
    subject: Optional[str] = None
    keywords: List[str] = []
    # Changed from 'metadata' to 'file_metadata' to match database field
    file_metadata: Dict[str, Any] = {}
    ai_analysis: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class PDFList(BaseModel):
    """Schema for paginated PDF list response"""
    pdfs: List[PDFResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PDFSearchRequest(BaseModel):
    """Schema for PDF search request"""
    query: Optional[str] = None
    topic_id: Optional[UUID] = None
    pdf_type: Optional[PDFType] = None
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    is_completed: Optional[bool] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("created_at", pattern="^(title|created_at|updated_at|reading_progress|total_pages)$")  # Changed from regex
    sort_order: str = Field("desc", pattern="^(asc|desc)$")  # Changed from regex


class PDFUploadResponse(BaseModel):
    """Schema for PDF upload response"""
    pdf_id: UUID
    message: str
    upload_status: UploadStatus
    processing_status: ProcessingStatus