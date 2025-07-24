from sqlalchemy import Column, String, Text, DateTime, Boolean, Integer, Numeric
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from database import Base

class Topic(Base):
    __tablename__ = "topics"
    
    # Match existing schema exactly
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    name = Column(String, nullable=False)  # Note: 'name' not 'title'
    description = Column(Text)
    color = Column(String)
    icon = Column(String)
    total_pdfs = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    study_progress = Column(Numeric, default=0.0)
    estimated_completion_hours = Column(Integer, default=0)
    difficulty_level = Column(Integer, default=1)
    priority_level = Column(Integer, default=1)
    is_archived = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    pdfs = relationship("PDF", back_populates="topic")
