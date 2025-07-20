# backend/common/database.py
"""
StudySprint 4.0 - Database Configuration
Fixed for Stage 3 with correct imports
"""

from sqlalchemy import create_engine, Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.sql import func
import uuid
from datetime import datetime
import os

# Database URL from environment
DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://osegonte@localhost:5432/studysprint4_local")

# SQLAlchemy setup
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7), default='#3498db')
    icon = Column(String(50), default='book')
    total_pdfs = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    study_progress = Column(DECIMAL(5,2), default=0.0)
    estimated_completion_hours = Column(Integer, default=0)
    difficulty_level = Column(Integer, default=1)
    priority_level = Column(Integer, default=1)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<Topic(id={self.id}, name='{self.name}', pdfs={self.total_pdfs})>"

    @property
    def completion_percentage(self):
        return float(self.study_progress)

    def update_progress(self, completed_pdfs: int, total_pdfs: int):
        self.total_pdfs = total_pdfs
        if total_pdfs > 0:
            self.study_progress = (completed_pdfs / total_pdfs) * 100
        else:
            self.study_progress = 0.0


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
    pdf_type = Column(String(20), default='study')
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
    file_metadata = Column(JSON, default={})
    ai_analysis = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    parent_pdf = relationship("PDF", remote_side=[id])

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
        self.current_page = current_page
        self.last_read_page = max(self.last_read_page, current_page)
        if self.total_pages > 0:
            self.reading_progress = (current_page / self.total_pages) * 100
            if current_page >= self.total_pages:
                self.is_completed = True
                self.completion_date = datetime.utcnow()
