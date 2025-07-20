# backend/modules/pdfs/models.py
"""
StudySprint 4.0 - PDF Module Models
SQLAlchemy models for PDF management and metadata
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, ARRAY, DECIMAL
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from datetime import datetime
from common.database import Base
from common.database import PDF, Topic

__all__ = ['PDF', 'Topic']

class PDF(Base):
    __tablename__ = "pdfs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"))
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer)
    total_pages = Column(Integer, default=0)
    current_page = Column(Integer, default=1)
    last_read_page = Column(Integer, default=1)
    reading_progress = Column(DECIMAL(5,2), default=0.0)
    pdf_type = Column(String(20), default='study')  # study, exercise, reference
    parent_pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id"))
    difficulty_level = Column(Integer, default=1)
    estimated_read_time_minutes = Column(Integer, default=0)
    actual_read_time_minutes = Column(Integer, default=0)
    is_completed = Column(Boolean, default=False)
    completion_date = Column(DateTime)
    upload_status = Column(String(20), default='completed')
    processing_status = Column(String(20), default='pending')
    content_hash = Column(String(64))
    extracted_text = Column(Text)
    language = Column(String(10), default='en')
    author = Column(String(255))
    subject = Column(String(255))
    keywords = Column(ARRAY(String))
    metadata = Column(JSON, default={})
    ai_analysis = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    topic = relationship("Topic", back_populates="pdfs")
    parent_pdf = relationship("PDF", remote_side=[id])
    child_pdfs = relationship("PDF", back_populates="parent_pdf")
    study_sessions = relationship("StudySession", back_populates="pdf")
    notes = relationship("Note", back_populates="pdf")
    highlights = relationship("Highlight", back_populates="pdf")
    bookmarks = relationship("Bookmark", back_populates="pdf")

    def __repr__(self):
        return f"<PDF(id={self.id}, title='{self.title}', pages={self.total_pages})>"

    @property
    def is_processing(self):
        return self.processing_status in ['pending', 'processing']

    @property
    def progress_percentage(self):
        if self.total_pages == 0:
            return 0
        return round((self.current_page / self.total_pages) * 100, 2)

    def update_reading_progress(self, current_page: int):
        """Update reading progress based on current page"""
        self.current_page = current_page
        self.last_read_page = max(self.last_read_page, current_page)
        if self.total_pages > 0:
            self.reading_progress = (current_page / self.total_pages) * 100
            if current_page >= self.total_pages:
                self.is_completed = True
                self.completion_date = datetime.utcnow()


# backend/modules/pdfs/schemas.py
"""
StudySprint 4.0 - PDF Module Schemas
Pydantic schemas for API request/response validation
"""

from pydantic import BaseModel, Field, validator
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
    
    @validator('current_page')
    def validate_current_page(cls, v):
        if v is not None and v < 1:
            raise ValueError('Current page must be at least 1')
        return v


class PDFMetadata(BaseModel):
    """Schema for PDF metadata extracted during processing"""
    file_size: int
    total_pages: int
    author: Optional[str] = None
    subject: Optional[str] = None
    keywords: List[str] = []
    language: str = "en"
    content_hash: str
    extracted_text: Optional[str] = None


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
    metadata: Dict[str, Any] = {}
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
    sort_by: str = Field("created_at", regex="^(title|created_at|updated_at|reading_progress|total_pages)$")
    sort_order: str = Field("desc", regex="^(asc|desc)$")


class PDFUploadResponse(BaseModel):
    """Schema for PDF upload response"""
    pdf_id: UUID
    message: str
    upload_status: UploadStatus
    processing_status: ProcessingStatus


class PDFProgressUpdate(BaseModel):
    """Schema for updating reading progress"""
    current_page: int = Field(..., ge=1)
    session_id: Optional[UUID] = None
    time_spent_seconds: Optional[int] = Field(None, ge=0)


class PDFStatsResponse(BaseModel):
    """Schema for PDF statistics"""
    total_pdfs: int
    completed_pdfs: int
    total_pages: int
    pages_read: int
    total_study_time_minutes: int
    average_reading_speed: float
    completion_rate: float


class TopicBase(BaseModel):
    """Base schema for Topic"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field("#3498db", regex="^#[0-9A-Fa-f]{6}$")
    icon: str = Field("book", max_length=50)
    difficulty_level: int = Field(1, ge=1, le=5)
    priority_level: int = Field(1, ge=1, le=5)


class TopicCreate(TopicBase):
    """Schema for creating a new topic"""
    pass


class TopicUpdate(BaseModel):
    """Schema for updating topic"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    priority_level: Optional[int] = Field(None, ge=1, le=5)
    is_archived: Optional[bool] = None


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


# Error schemas
class ErrorResponse(BaseModel):
    """Schema for error responses"""
    error: str
    message: str
    details: Optional[Dict[str, Any]] = None


class ValidationErrorResponse(BaseModel):
    """Schema for validation error responses"""
    error: str = "validation_error"
    message: str
    errors: List[Dict[str, Any]]