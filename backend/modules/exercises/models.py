from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, Float
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from database import Base

class Exercise(Base):
    __tablename__ = "exercises"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    explanation = Column(Text)
    
    # Store topic_id as UUID - no relationships for now
    topic_id = Column(UUID(as_uuid=True), nullable=False)
    
    # Exercise Properties
    exercise_type = Column(String(50), default="multiple_choice")
    difficulty = Column(Float, default=1.0)
    estimated_time = Column(Integer, default=5)
    
    # Metadata
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    is_active = Column(Boolean, default=True)

class ExerciseAttempt(Base):
    __tablename__ = "exercise_attempts"
    
    id = Column(Integer, primary_key=True, index=True)
    exercise_id = Column(Integer, nullable=False)
    
    # Attempt Data
    user_answer = Column(Text, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Float, default=0.0)
    time_taken = Column(Integer)
    confidence_level = Column(Integer)
    
    # Metadata
    attempted_at = Column(DateTime, server_default=func.now())
