# backend/modules/sessions/models.py
"""
StudySprint 4.0 - Complete Study Sessions Models
Final implementation with all advanced features
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta
from common.database import Base

exercise_attempts = relationship("ExerciseAttempt", back_populates="session")

class StudySession(Base):
    __tablename__ = "study_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"))
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"))
    exercise_id = Column(UUID(as_uuid=True))
    
    # Session identification
    session_type = Column(String(20), default='study')  # study, exercise, review, research
    session_name = Column(String(255))
    
    # Timing data
    start_time = Column(DateTime, default=datetime.utcnow)
    end_time = Column(DateTime)
    planned_duration_minutes = Column(Integer, default=60)
    total_minutes = Column(Integer, default=0)
    active_minutes = Column(Integer, default=0)
    idle_minutes = Column(Integer, default=0)
    break_minutes = Column(Integer, default=0)
    
    # Progress tracking
    pages_visited = Column(Integer, default=0)
    pages_completed = Column(Integer, default=0)
    starting_page = Column(Integer, default=1)
    ending_page = Column(Integer, default=1)
    
    # Pomodoro integration
    pomodoro_cycles = Column(Integer, default=0)
    interruptions = Column(Integer, default=0)
    
    # Analytics and scoring
    focus_score = Column(DECIMAL(3,2), default=0.0)
    productivity_score = Column(DECIMAL(3,2), default=0.0)
    difficulty_rating = Column(Integer)  # 1-5 user rating
    energy_level = Column(Integer)  # 1-5 user rating
    mood_rating = Column(Integer)  # 1-5 user rating
    environment_type = Column(String(50))  # home, library, cafe, etc.
    
    # Goals and achievements
    notes = Column(Text)
    goals_set = Column(ARRAY(String))
    goals_achieved = Column(ARRAY(String))
    xp_earned = Column(Integer, default=0)
    
    # Metadata
    session_data = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<StudySession(id={self.id}, type='{self.session_type}', duration={self.total_minutes}min)>"

    @property
    def is_active(self):
        """Check if session is currently active"""
        return self.start_time is not None and self.end_time is None

    @property
    def duration_seconds(self):
        """Get session duration in seconds"""
        if self.end_time and self.start_time:
            return (self.end_time - self.start_time).total_seconds()
        elif self.start_time and not self.end_time:
            return (datetime.utcnow() - self.start_time).total_seconds()
        return 0

    @property
    def efficiency_score(self):
        """Calculate efficiency based on active vs total time"""
        if self.total_minutes == 0:
            return 0.0
        return (self.active_minutes / self.total_minutes) * 100

    def calculate_focus_score(self):
        """Calculate focus score based on various factors"""
        if self.total_minutes == 0:
            return 0.0
        
        # Base score from active time ratio
        active_ratio = self.active_minutes / self.total_minutes if self.total_minutes > 0 else 0
        
        # Penalty for interruptions
        interruption_penalty = min(self.interruptions * 0.1, 0.5)
        
        # Bonus for completing pomodoro cycles
        pomodoro_bonus = min(self.pomodoro_cycles * 0.05, 0.3)
        
        focus_score = (active_ratio * 100) - (interruption_penalty * 100) + (pomodoro_bonus * 100)
        return max(0.0, min(100.0, focus_score))

    def end_session(self):
        """End the session and calculate final metrics"""
        if not self.end_time:
            self.end_time = datetime.utcnow()
            self.total_minutes = int(self.duration_seconds / 60)
            self.focus_score = self.calculate_focus_score()
            
            # Calculate XP based on session quality and duration
            base_xp = self.total_minutes
            quality_multiplier = 1 + (float(self.focus_score) / 100)
            self.xp_earned = int(base_xp * quality_multiplier)


class PageTime(Base):
    __tablename__ = "page_times"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="CASCADE"))
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"))
    page_number = Column(Integer, nullable=False)
    visit_sequence = Column(Integer, default=1)
    
    # Timing data
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    duration_seconds = Column(Integer, default=0)
    idle_time_seconds = Column(Integer, default=0)
    active_time_seconds = Column(Integer, default=0)
    
    # Activity metrics
    activity_count = Column(Integer, default=0)
    scroll_events = Column(Integer, default=0)
    zoom_events = Column(Integer, default=0)
    
    # Reading analytics
    reading_speed_wpm = Column(DECIMAL(5,2))
    words_on_page = Column(Integer)
    difficulty_rating = Column(Integer)
    comprehension_estimate = Column(DECIMAL(3,2))
    attention_score = Column(DECIMAL(3,2))
    
    # Content interaction
    notes_created = Column(Integer, default=0)
    highlights_made = Column(Integer, default=0)
    bookmarks_added = Column(Integer, default=0)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<PageTime(session={self.session_id}, page={self.page_number}, duration={self.duration_seconds}s)>"

    def calculate_reading_speed(self):
        """Calculate reading speed in words per minute"""
        if self.words_on_page and self.active_time_seconds > 0:
            minutes = self.active_time_seconds / 60
            self.reading_speed_wpm = self.words_on_page / minutes
        return self.reading_speed_wpm


class PomodoroSession(Base):
    __tablename__ = "pomodoro_sessions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    study_session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="CASCADE"))
    
    # Cycle information
    cycle_number = Column(Integer)
    cycle_type = Column(String(20))  # work, short_break, long_break
    planned_duration_minutes = Column(Integer)
    actual_duration_minutes = Column(Integer)
    completed = Column(Boolean, default=False)
    
    # Quality metrics
    interruptions = Column(Integer, default=0)
    interruption_types = Column(ARRAY(String))
    effectiveness_rating = Column(Integer)  # 1-5 user rating
    focus_rating = Column(Integer)  # 1-5 user rating
    task_completed = Column(Boolean, default=False)
    
    # Session data
    notes = Column(Text)
    xp_earned = Column(Integer, default=0)
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime)

    def __repr__(self):
        return f"<PomodoroSession(cycle={self.cycle_number}, type='{self.cycle_type}', completed={self.completed})>"

    @property
    def is_active(self):
        """Check if pomodoro cycle is currently active"""
        return self.started_at is not None and self.completed_at is None

    def complete_cycle(self, effectiveness_rating=None, focus_rating=None):
        """Mark the pomodoro cycle as complete"""
        if not self.completed_at:
            self.completed_at = datetime.utcnow()
            self.completed = True
            
            if self.started_at:
                duration = (self.completed_at - self.started_at).total_seconds() / 60
                self.actual_duration_minutes = int(duration)
            
            if effectiveness_rating:
                self.effectiveness_rating = effectiveness_rating
            if focus_rating:
                self.focus_rating = focus_rating
                
            # Calculate XP based on completion and ratings
            base_xp = 10 if self.cycle_type == 'work' else 5
            if self.effectiveness_rating:
                base_xp *= (self.effectiveness_rating / 3)  # Scale by rating
            self.xp_earned = int(base_xp)


class ReadingSpeed(Base):
    __tablename__ = "reading_speeds"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id"))
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    
    # Speed metrics
    pages_per_minute = Column(DECIMAL(5,2))
    words_per_minute = Column(DECIMAL(5,2))
    
    # Context factors
    content_type = Column(String(50))  # text, math, diagrams, mixed
    difficulty_level = Column(Integer)
    
    # Temporal factors
    time_of_day = Column(Integer)  # hour 0-23
    day_of_week = Column(Integer)  # 0-6
    week_of_year = Column(Integer)
    month = Column(Integer)
    season = Column(String(10))
    
    # Environmental factors
    environmental_factors = Column(JSON, default={})
    cognitive_load = Column(Integer)  # 1-5
    
    calculated_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ReadingSpeed(wpm={self.words_per_minute}, type='{self.content_type}')>"


class TimeEstimate(Base):
    __tablename__ = "time_estimates"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id"))
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    
    # Estimate details
    estimate_type = Column(String(20))  # completion, daily_progress, weekly_goal
    estimated_minutes = Column(Integer)
    estimated_sessions = Column(Integer)
    estimated_pages_per_session = Column(Integer)
    confidence_level = Column(String(20))  # low, medium, high
    
    # Algorithm metadata
    based_on_sessions = Column(Integer, default=0)
    accuracy_score = Column(DECIMAL(3,2))
    factors_used = Column(JSON, default={})
    algorithm_version = Column(String(10), default='1.0')
    
    # Validation
    calculated_at = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime)
    actual_minutes = Column(Integer)  # filled when completed
    accuracy_percentage = Column(DECIMAL(5,2))  # calculated post-completion

    def __repr__(self):
        return f"<TimeEstimate(type='{self.estimate_type}', minutes={self.estimated_minutes})>"

    def validate_accuracy(self, actual_minutes):
        """Calculate accuracy after completion"""
        if self.estimated_minutes and actual_minutes:
            self.actual_minutes = actual_minutes
            error = abs(self.estimated_minutes - actual_minutes)
            self.accuracy_percentage = max(0, 100 - (error / self.estimated_minutes * 100))