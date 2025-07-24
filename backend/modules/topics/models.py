# backend/modules/topics/models.py - Week 1 Simplified
from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from common.database import Base

class Topic(Base):
    __tablename__ = "topics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    color = Column(String(7), default="#3498db")
    icon = Column(String(50), default="book")
    
    # Statistics
    total_pdfs = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    study_progress = Column(Numeric(5,2), default=0.0)
    estimated_completion_hours = Column(Integer, default=0)
    
    # Settings
    difficulty_level = Column(Integer, default=1)
    priority_level = Column(Integer, default=1)
    is_archived = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Topic(id={self.id}, name='{self.name}')>"
