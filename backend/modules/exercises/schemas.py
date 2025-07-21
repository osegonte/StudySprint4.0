from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum
import uuid

class ExerciseType(str, Enum):
    MULTIPLE_CHOICE = "multiple_choice"
    ESSAY = "essay"
    PROBLEM_SOLVING = "problem_solving"
    TRUE_FALSE = "true_false"
    FILL_BLANK = "fill_blank"

class ExerciseCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    question: str = Field(..., min_length=1)
    answer: str = Field(..., min_length=1)
    explanation: Optional[str] = None
    
    topic_id: uuid.UUID  # Use UUID type
    
    exercise_type: ExerciseType = ExerciseType.MULTIPLE_CHOICE
    estimated_time: int = Field(default=5, ge=1, le=120)

class ExerciseUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    question: Optional[str] = None
    answer: Optional[str] = None
    explanation: Optional[str] = None
    
    exercise_type: Optional[ExerciseType] = None
    estimated_time: Optional[int] = Field(None, ge=1, le=120)
    is_active: Optional[bool] = None

class ExerciseResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    question: str
    answer: str
    explanation: Optional[str]
    
    topic_id: uuid.UUID
    
    exercise_type: str
    difficulty: float
    estimated_time: int
    
    created_at: datetime
    updated_at: datetime
    is_active: bool
    
    # Performance metrics (calculated)
    total_attempts: int = 0
    success_rate: float = 0.0
    average_time: float = 0.0
    last_attempted: Optional[datetime] = None

    class Config:
        from_attributes = True

class ExerciseAttemptCreate(BaseModel):
    exercise_id: int
    user_answer: str = Field(..., min_length=1)
    confidence_level: int = Field(..., ge=1, le=5)
    time_taken: int = Field(..., ge=1)  # seconds

class ExerciseAttemptResponse(BaseModel):
    id: int
    exercise_id: int
    
    user_answer: str
    is_correct: bool
    score: float
    time_taken: Optional[int]
    confidence_level: Optional[int]
    
    attempted_at: datetime
    
    # Include exercise details for context
    exercise_title: Optional[str] = None
    correct_answer: Optional[str] = None
    explanation: Optional[str] = None

    class Config:
        from_attributes = True

class ExerciseAnalytics(BaseModel):
    total_exercises: int
    exercises_completed: int
    completion_rate: float
    average_score: float
    time_spent: int  # minutes
    exercises_due: int
    improvement_trend: str  # "improving", "stable", "declining"

class ReviewDueResponse(BaseModel):
    total_due: int
    exercises: List[ExerciseResponse]
    priority_exercises: List[ExerciseResponse]
    estimated_time: int
