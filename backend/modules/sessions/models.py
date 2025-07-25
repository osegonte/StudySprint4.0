# backend/modules/sessions/models.py
"""
StudySprint 4.0 - Complete Study Sessions Models
Week 2: Production-ready session tracking with comprehensive analytics
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Any
from common.database import Base


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

    # Relationships - Fixed to avoid circular imports
    page_times = relationship("PageTime", back_populates="session", cascade="all, delete-orphan")
    pomodoro_sessions = relationship("PomodoroSession", back_populates="study_session", cascade="all, delete-orphan")

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

    def calculate_advanced_focus_score(self, activity_events=None, break_records=None):
        """Advanced focus score calculation with multiple factors"""
        if self.total_minutes == 0:
            return 0.0
    
        # Base score from active time ratio
        active_ratio = self.active_minutes / self.total_minutes if self.total_minutes > 0 else 0
        base_score = active_ratio * 100
    
        # Activity consistency factor
        consistency_bonus = 0.0
        if activity_events and len(activity_events) > 0:
            # Reward consistent activity distribution
            time_gaps = []
            for i in range(1, len(activity_events)):
                gap = (activity_events[i].event_timestamp - activity_events[i-1].event_timestamp).total_seconds()
                time_gaps.append(gap)
        
            if time_gaps:
                avg_gap = sum(time_gaps) / len(time_gaps)
                if 30 <= avg_gap <= 300:  # Optimal activity every 30 seconds to 5 minutes
                    consistency_bonus = 10.0
    
        # Break quality factor
        break_penalty = 0.0
        if break_records:
            total_break_time = sum(b.duration_minutes for b in break_records if b.duration_minutes)
            if total_break_time > 0:
               avg_break_duration = total_break_time / len(break_records)
               # Penalty for very long breaks (>15 min) or too many short breaks (<2 min)
               if avg_break_duration > 15:
                   break_penalty = min(20, (avg_break_duration - 15) * 2)
               elif avg_break_duration < 2:
                   break_penalty = (2 - avg_break_duration) * 5
    
        # Interruption penalty
        interruption_penalty = min(self.interruptions * 5, 25)
    
        # Pomodoro bonus
        pomodoro_bonus = min(self.pomodoro_cycles * 3, 15)
    
        # Final calculation
        focus_score = base_score + consistency_bonus + pomodoro_bonus - break_penalty - interruption_penalty
        return max(0.0, min(100.0, focus_score))

    def calculate_productivity_score(self):
        """Calculate productivity based on output and efficiency"""
        if self.total_minutes == 0:
            return 0.0
    
        # Base productivity from pages completed
        pages_score = min(50, self.pages_completed * 5) if self.pages_completed > 0 else 0
    
        # Efficiency score
        efficiency = self.efficiency_score
        efficiency_score = efficiency * 0.3
    
        # Goal achievement bonus
        goals_achieved_count = len(self.goals_achieved) if self.goals_achieved else 0
        goals_set_count = len(self.goals_set) if self.goals_set else 1
        goal_score = (goals_achieved_count / goals_set_count) * 20
    
        # Focus integration
        focus_contribution = float(self.focus_score) * 0.2
    
        productivity = pages_score + efficiency_score + goal_score + focus_contribution
        return max(0.0, min(100.0, productivity))
    
    def update_focus_score(self, session_id: UUID) -> float:
        """Calculate and update real-time focus score"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            return 0.0
    
        # Get activity events for this session
        activity_events = self.db.query(ActivityEvent).filter(
            ActivityEvent.session_id == session_id
        ).order_by(ActivityEvent.event_timestamp).all()
    
        # Get break records
        break_records = self.db.query(SessionBreak).filter(
            SessionBreak.session_id == session_id
        ).all()
    
        # Calculate advanced focus score
        new_focus_score = session.calculate_advanced_focus_score(activity_events, break_records)
        new_productivity_score = session.calculate_productivity_score()
    
        # Update session
        session.focus_score = new_focus_score
        session.productivity_score = new_productivity_score
        self.db.commit()
    
        logger.info(f"Focus score updated for session {session_id}: {new_focus_score:.1f}")
        return new_focus_score
    
    def register_activity_event(self, session_id: UUID, event_type: str, event_data: dict = None) -> bool:
        """Register an activity event for focus tracking"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session or session.end_time:
            return False
    
        # Create activity event
        activity_event = ActivityEvent(
            session_id=session_id,
            event_type=event_type,
            event_timestamp=datetime.utcnow(),
            event_data=event_data or {},
            focus_state="focused",  # Will be enhanced later
            attention_score=1.0     # Will be calculated based on patterns
        )
    
        self.db.add(activity_event)
    
        # Update real-time focus score
        self.update_focus_score(session_id)
    
        self.db.commit()
        return True

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

    # Relationships
    session = relationship("StudySession", back_populates="page_times")

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

    # Relationships
    study_session = relationship("StudySession", back_populates="pomodoro_sessions")

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


# Additional models for enhanced session tracking

class SessionGoal(Base):
    __tablename__ = "session_goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="CASCADE"))
    
    # Goal details
    goal_text = Column(String(500), nullable=False)
    goal_type = Column(String(30))  # pages, time, comprehension, practice
    target_value = Column(Float)
    current_value = Column(Float, default=0.0)
    
    # Status
    is_achieved = Column(Boolean, default=False)
    achievement_time = Column(DateTime)
    notes = Column(Text)
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SessionGoal(text='{self.goal_text[:30]}...', achieved={self.is_achieved})>"


class SessionBreak(Base):
    __tablename__ = "session_breaks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="CASCADE"))
    
    # Break timing
    break_start = Column(DateTime, nullable=False)
    break_end = Column(DateTime)
    duration_minutes = Column(Integer)
    
    # Break details
    break_type = Column(String(20))  # planned, interruption, pomodoro, fatigue
    break_reason = Column(String(100))
    activity_during_break = Column(String(100))
    
    # Recovery metrics
    energy_before = Column(Integer)  # 1-5
    energy_after = Column(Integer)   # 1-5
    focus_recovery = Column(DECIMAL(3,2))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<SessionBreak(type='{self.break_type}', duration={self.duration_minutes}min)>"


class ActivityEvent(Base):
    __tablename__ = "activity_events"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id", ondelete="CASCADE"))
    page_time_id = Column(UUID(as_uuid=True), ForeignKey("page_times.id", ondelete="CASCADE"))
    
    # Event details
    event_type = Column(String(30))  # click, scroll, zoom, highlight, note, bookmark
    event_timestamp = Column(DateTime, default=datetime.utcnow)
    page_number = Column(Integer)
    
    # Event metadata
    event_data = Column(JSON, default={})  # coordinates, text content, etc.
    duration_ms = Column(Integer)  # for sustained actions
    
    # Context
    focus_state = Column(String(20))  # focused, distracted, idle
    attention_score = Column(DECIMAL(3,2))
    
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<ActivityEvent(type='{self.event_type}', page={self.page_number})>"