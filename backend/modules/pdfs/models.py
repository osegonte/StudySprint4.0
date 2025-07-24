# backend/modules/pdfs/models.py - Simplified version
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy import DECIMAL
import uuid
from datetime import datetime
from common.database import Base

class PDF(Base):
    __tablename__ = "pdfs"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"))
    
    # Basic file information
    title = Column(String(255), nullable=False)
    description = Column(Text)
    file_name = Column(String(255), nullable=False)
    file_path = Column(Text, nullable=False)
    file_size = Column(Integer)
    
    # Simple progress tracking
    total_pages = Column(Integer, default=0)
    current_page = Column(Integer, default=1)
    reading_progress = Column(DECIMAL(5,2), default=0.0)
    is_completed = Column(Boolean, default=False)
    
    # Basic metadata
    pdf_type = Column(String(20), default='study')
    difficulty_level = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PDF(id={self.id}, title='{self.title}', pages={self.total_pages})>"

    @property
    def progress_percentage(self):
        if self.total_pages == 0:
            return 0
        return round((self.current_page / self.total_pages) * 100, 2)