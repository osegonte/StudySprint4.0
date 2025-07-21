# backend/modules/sessions/schemas.py
"""
StudySprint 4.0 - Complete Study Sessions Schemas
Final Pydantic schemas for session API validation
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID
from enum import Enum


class SessionType(str, Enum):
    STUDY = "study"
    EXERCISE = "exercise"
    REVIEW = "review"
    RESEARCH = "research"


class CycleType(str, Enum):
    WORK = "work"
    SHORT_BREAK = "short_break"
    LONG_BREAK = "long_break"


class EnvironmentType(str, Enum):
    HOME = "home"
    LIBRARY = "library"
    CAFE = "cafe"
    OFFICE = "office"
    OUTDOOR = "outdoor"
    OTHER = "other"


# Study Session Schemas
class StudySessionCreate(BaseModel):
    """Schema for creating a new study session"""
    pdf_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None
    exercise_id: Optional[UUID] = None
    session_type: SessionType = SessionType.STUDY
    session_name: Optional[str] = None
    planned_duration_minutes: int = Field(60, ge=5, le=480)  # 5 min to 8 hours
    starting_page: int = Field(1, ge=1)
    goals_set: List[str] = []
    environment_type: Optional[EnvironmentType] = None


class StudySessionUpdate(BaseModel):
    """Schema for updating session during progress"""
    current_page: Optional[int] = Field(None, ge=1)
    ending_page: Optional[int] = Field(None, ge=1)
    pages_visited: Optional[int] = Field(None, ge=0)
    pages_completed: Optional[int] = Field(None, ge=0)
    interruptions: Optional[int] = Field(None, ge=0)
    notes: Optional[str] = None
    goals_achieved: Optional[List[str]] = None
    active_minutes: Optional[int] = Field(None, ge=0)
    idle_minutes: Optional[int] = Field(None, ge=0)
    break_minutes: Optional[int] = Field(None, ge=0)


class StudySessionEnd(BaseModel):
    """Schema for ending a study session"""
    ending_page: Optional[int] = Field(None, ge=1)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)
    energy_level: Optional[int] = Field(None, ge=1, le=5)
    mood_rating: Optional[int] = Field(None, ge=1, le=5)
    goals_achieved: Optional[List[str]] = None
    notes: Optional[str] = None
    session_summary: Optional[str] = None


class StudySessionResponse(BaseModel):
    """Schema for study session response"""
    id: UUID
    pdf_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None
    exercise_id: Optional[UUID] = None
    session_type: SessionType
    session_name: Optional[str] = None
    
    # Timing data
    start_time: datetime
    end_time: Optional[datetime] = None
    planned_duration_minutes: int
    total_minutes: int
    active_minutes: int
    idle_minutes: int
    break_minutes: int
    
    # Progress
    pages_visited: int
    pages_completed: int
    starting_page: int
    ending_page: int
    
    # Pomodoro and focus
    pomodoro_cycles: int
    interruptions: int
    focus_score: float
    productivity_score: float
    
    # Ratings
    difficulty_rating: Optional[int] = None
    energy_level: Optional[int] = None
    mood_rating: Optional[int] = None
    environment_type: Optional[str] = None
    
    # Goals and notes
    notes: Optional[str] = None
    goals_set: List[str]
    goals_achieved: List[str]
    xp_earned: int
    
    # Metadata
    session_data: Dict[str, Any]
    created_at: datetime
    
    # Computed properties
    is_active: bool
    duration_seconds: float
    efficiency_score: float

    class Config:
        from_attributes = True


# Page Time Schemas
class PageTimeCreate(BaseModel):
    """Schema for starting page time tracking"""
    session_id: UUID
    pdf_id: UUID
    page_number: int = Field(..., ge=1)
    visit_sequence: int = Field(1, ge=1)
    words_on_page: Optional[int] = Field(None, ge=0)


class PageTimeUpdate(BaseModel):
    """Schema for updating page time tracking"""
    activity_count: Optional[int] = Field(None, ge=0)
    scroll_events: Optional[int] = Field(None, ge=0)
    zoom_events: Optional[int] = Field(None, ge=0)
    notes_created: Optional[int] = Field(None, ge=0)
    highlights_made: Optional[int] = Field(None, ge=0)
    bookmarks_added: Optional[int] = Field(None, ge=0)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)
    comprehension_estimate: Optional[float] = Field(None, ge=0.0, le=1.0)


class PageTimeEnd(BaseModel):
    """Schema for ending page time tracking"""
    idle_time_seconds: Optional[int] = Field(None, ge=0)
    activity_count: Optional[int] = Field(None, ge=0)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)
    comprehension_estimate: Optional[float] = Field(None, ge=0.0, le=1.0)


class PageTimeResponse(BaseModel):
    """Schema for page time response"""
    id: UUID
    session_id: UUID
    pdf_id: UUID
    page_number: int
    visit_sequence: int
    
    # Timing
    start_time: datetime
    end_time: Optional[datetime] = None
    duration_seconds: int
    idle_time_seconds: int
    active_time_seconds: int
    
    # Activity
    activity_count: int
    scroll_events: int
    zoom_events: int
    
    # Analytics
    reading_speed_wpm: Optional[float] = None
    words_on_page: Optional[int] = None
    difficulty_rating: Optional[int] = None
    comprehension_estimate: Optional[float] = None
    attention_score: Optional[float] = None
    
    # Interactions
    notes_created: int
    highlights_made: int
    bookmarks_added: int
    
    created_at: datetime

    class Config:
        from_attributes = True


# Pomodoro Session Schemas
class PomodoroSessionCreate(BaseModel):
    """Schema for starting a Pomodoro cycle"""
    study_session_id: UUID
    cycle_number: int = Field(..., ge=1)
    cycle_type: CycleType
    planned_duration_minutes: int = Field(..., ge=1, le=60)


class PomodoroSessionComplete(BaseModel):
    """Schema for completing a Pomodoro cycle"""
    effectiveness_rating: Optional[int] = Field(None, ge=1, le=5)
    focus_rating: Optional[int] = Field(None, ge=1, le=5)
    task_completed: Optional[bool] = None
    interruptions: Optional[int] = Field(None, ge=0)
    interruption_types: Optional[List[str]] = None
    notes: Optional[str] = None


class PomodoroSessionResponse(BaseModel):
    """Schema for Pomodoro session response"""
    id: UUID
    study_session_id: UUID
    cycle_number: int
    cycle_type: CycleType
    planned_duration_minutes: int
    actual_duration_minutes: Optional[int] = None
    completed: bool
    
    # Quality metrics
    interruptions: int
    interruption_types: List[str]
    effectiveness_rating: Optional[int] = None
    focus_rating: Optional[int] = None
    task_completed: Optional[bool] = None
    
    # Session data
    notes: Optional[str] = None
    xp_earned: int
    started_at: datetime
    completed_at: Optional[datetime] = None
    
    # Computed
    is_active: bool

    class Config:
        from_attributes = True


# Analytics Schemas
class SessionAnalytics(BaseModel):
    """Schema for session analytics"""
    total_sessions: int
    total_study_time_minutes: int
    average_session_duration: float
    average_focus_score: float
    average_productivity_score: float
    total_pages_read: int
    average_reading_speed_wpm: float
    total_pomodoro_cycles: int
    total_xp_earned: int
    
    # Trends
    focus_trend: List[float]
    productivity_trend: List[float]
    daily_study_minutes: List[int]
    
    # Insights
    best_study_time: Optional[str] = None
    most_productive_environment: Optional[str] = None
    average_session_rating: float


class StudySessionList(BaseModel):
    """Schema for paginated session list"""
    sessions: List[StudySessionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class SessionSearchParams(BaseModel):
    """Schema for session search parameters"""
    pdf_id: Optional[UUID] = None
    topic_id: Optional[UUID] = None
    session_type: Optional[SessionType] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_duration: Optional[int] = Field(None, ge=1)
    max_duration: Optional[int] = Field(None, ge=1)
    min_focus_score: Optional[float] = Field(None, ge=0.0, le=100.0)
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("start_time", pattern="^(start_time|duration|focus_score|productivity_score)$")
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


# Timer State Schema
class TimerState(BaseModel):
    """Schema for real-time timer state"""
    session_id: UUID
    is_active: bool
    elapsed_seconds: int
    current_page: Optional[int] = None
    focus_events: int
    idle_events: int
    last_activity: datetime
    pomodoro_active: bool
    pomodoro_time_remaining: Optional[int] = None