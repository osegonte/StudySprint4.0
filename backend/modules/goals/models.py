# backend/modules/goals/models.py
"""
StudySprint 4.0 - Goals Module Models
Stage 6: Comprehensive goal tracking with SMART goals and milestones
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL, Enum
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, timedelta
from enum import Enum as PyEnum
from common.database import Base


class GoalType(PyEnum):
    TIME_BASED = "time_based"          # Study X hours per week
    COMPLETION = "completion"          # Complete X PDFs/exercises
    SKILL_BASED = "skill_based"        # Master specific skills
    PERFORMANCE = "performance"        # Achieve X% accuracy
    HABIT = "habit"                   # Study daily for X days
    PROJECT = "project"               # Complete specific project


class GoalStatus(PyEnum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class GoalPriority(PyEnum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class Goal(Base):
    __tablename__ = "goals"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Basic goal information
    title = Column(String(255), nullable=False)
    description = Column(Text)
    goal_type = Column(String(20), nullable=False)  # GoalType enum
    status = Column(String(20), default=GoalStatus.ACTIVE.value)
    priority = Column(String(20), default=GoalPriority.MEDIUM.value)
    
    # SMART criteria
    specific_description = Column(Text)  # What exactly will be accomplished
    measurable_criteria = Column(JSON)   # How progress will be measured
    achievable_plan = Column(Text)       # How the goal is achievable
    relevant_reason = Column(Text)       # Why this goal matters
    time_bound_deadline = Column(DateTime)  # When it will be completed
    
    # Associations
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id"))
    parent_goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"))
    
    # Progress tracking
    target_value = Column(Float)         # Target amount (hours, pages, etc.)
    current_value = Column(Float, default=0.0)
    target_unit = Column(String(50))     # hours, pages, exercises, etc.
    progress_percentage = Column(DECIMAL(5,2), default=0.0)
    
    # Time management
    start_date = Column(DateTime, default=datetime.utcnow)
    target_date = Column(DateTime)
    completed_date = Column(DateTime)
    estimated_hours = Column(Integer)
    actual_hours = Column(Integer, default=0)
    
    # Streak and consistency
    streak_count = Column(Integer, default=0)
    best_streak = Column(Integer, default=0)
    consistency_score = Column(DECIMAL(3,2), default=0.0)
    last_activity_date = Column(DateTime)
    
    # Motivation and rewards
    motivation_notes = Column(Text)
    reward_description = Column(Text)
    difficulty_rating = Column(Integer, default=3)  # 1-5 scale
    importance_rating = Column(Integer, default=3)  # 1-5 scale
    
    # Analytics
    xp_reward = Column(Integer, default=0)
    badges_earned = Column(ARRAY(String))
    milestones_count = Column(Integer, default=0)
    sub_goals_count = Column(Integer, default=0)
    
    # Metadata
    tags = Column(ARRAY(String))
    goal_metadata = Column(JSON, default={})
    reminder_frequency = Column(String(20))  # daily, weekly, custom
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    milestones = relationship("Milestone", back_populates="goal", cascade="all, delete-orphan")
    progress_logs = relationship("GoalProgress", back_populates="goal", cascade="all, delete-orphan")
    sub_goals = relationship("Goal", back_populates="parent_goal")
    parent_goal = relationship("Goal", remote_side=[id])

    def __repr__(self):
        return f"<Goal(id={self.id}, title='{self.title}', progress={self.progress_percentage}%)>"

    @property
    def is_completed(self):
        """Check if goal is completed"""
        return self.status == GoalStatus.COMPLETED.value

    @property
    def is_overdue(self):
        """Check if goal is overdue"""
        return (self.target_date and 
                datetime.utcnow() > self.target_date and 
                not self.is_completed)

    @property
    def days_remaining(self):
        """Calculate days remaining until deadline"""
        if not self.target_date:
            return None
        delta = self.target_date - datetime.utcnow()
        return max(0, delta.days)

    @property
    def completion_rate(self):
        """Calculate completion rate as percentage"""
        if not self.target_value or self.target_value == 0:
            return 0.0
        return min(100.0, (self.current_value / self.target_value) * 100)

    def update_progress(self, new_value: float, session_id: UUID = None):
        """Update goal progress and trigger milestone checks"""
        old_value = self.current_value
        self.current_value = new_value
        self.progress_percentage = self.completion_rate
        self.last_activity_date = datetime.utcnow()
        
        # Update streak if daily goal
        if self.goal_type == GoalType.HABIT.value:
            self._update_streak()
        
        # Check if goal is completed
        if self.completion_rate >= 100 and not self.is_completed:
            self.complete_goal()
        
        # Log progress
        self._log_progress(old_value, new_value, session_id)

    def complete_goal(self):
        """Mark goal as completed and calculate rewards"""
        self.status = GoalStatus.COMPLETED.value
        self.completed_date = datetime.utcnow()
        self.progress_percentage = 100.0
        
        # Calculate XP reward based on difficulty and importance
        base_xp = 100
        difficulty_multiplier = self.difficulty_rating / 3.0
        importance_multiplier = self.importance_rating / 3.0
        
        # Time bonus (completed early gets bonus)
        time_bonus = 1.0
        if self.target_date and self.completed_date <= self.target_date:
            days_early = (self.target_date - self.completed_date).days
            time_bonus = 1.0 + (days_early * 0.02)  # 2% bonus per day early
        
        self.xp_reward = int(base_xp * difficulty_multiplier * importance_multiplier * time_bonus)

    def _update_streak(self):
        """Update streak count for habit-type goals"""
        today = datetime.utcnow().date()
        last_activity = self.last_activity_date.date() if self.last_activity_date else None
        
        if last_activity:
            if last_activity == today:
                return  # Already updated today
            elif last_activity == today - timedelta(days=1):
                self.streak_count += 1
                self.best_streak = max(self.best_streak, self.streak_count)
            else:
                self.streak_count = 1  # Reset streak
        else:
            self.streak_count = 1

    def _log_progress(self, old_value: float, new_value: float, session_id: UUID = None):
        """Log progress change"""
        progress_log = GoalProgress(
            goal_id=self.id,
            session_id=session_id,
            previous_value=old_value,
            new_value=new_value,
            change_amount=new_value - old_value,
            progress_percentage=self.completion_rate,
            notes=f"Progress updated from {old_value} to {new_value} {self.target_unit}"
        )
        # This would be added to the session in the service layer


class Milestone(Base):
    __tablename__ = "milestones"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"))
    
    # Milestone details
    title = Column(String(255), nullable=False)
    description = Column(Text)
    target_value = Column(Float)
    target_percentage = Column(DECIMAL(5,2))
    order_sequence = Column(Integer)
    
    # Status
    is_completed = Column(Boolean, default=False)
    completed_date = Column(DateTime)
    
    # Rewards
    xp_reward = Column(Integer, default=25)
    badge_name = Column(String(100))
    celebration_message = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    goal = relationship("Goal", back_populates="milestones")

    def __repr__(self):
        return f"<Milestone(id={self.id}, title='{self.title}', completed={self.is_completed})>"

    def check_completion(self, current_progress: float):
        """Check if milestone should be marked as completed"""
        if not self.is_completed and current_progress >= self.target_percentage:
            self.complete_milestone()

    def complete_milestone(self):
        """Mark milestone as completed"""
        self.is_completed = True
        self.completed_date = datetime.utcnow()


class GoalProgress(Base):
    __tablename__ = "goal_progress"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id", ondelete="CASCADE"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    
    # Progress data
    previous_value = Column(Float)
    new_value = Column(Float)
    change_amount = Column(Float)
    progress_percentage = Column(DECIMAL(5,2))
    
    # Context
    activity_type = Column(String(50))  # study, exercise, reading, etc.
    notes = Column(Text)
    automatic_update = Column(Boolean, default=True)
    
    # Timestamps
    recorded_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    goal = relationship("Goal", back_populates="progress_logs")

    def __repr__(self):
        return f"<GoalProgress(goal={self.goal_id}, change={self.change_amount})>"


class Achievement(Base):
    __tablename__ = "achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Achievement details
    name = Column(String(255), nullable=False)
    description = Column(Text)
    category = Column(String(50))  # study, consistency, milestone, special
    badge_icon = Column(String(100))
    badge_color = Column(String(7), default="#FFD700")
    
    # Earning criteria
    criteria_type = Column(String(50))  # goals_completed, study_streak, total_hours, etc.
    criteria_value = Column(Float)
    criteria_description = Column(Text)
    
    # Rewards
    xp_reward = Column(Integer, default=50)
    rarity = Column(String(20), default="common")  # common, rare, epic, legendary
    
    # Status
    is_active = Column(Boolean, default=True)
    unlock_level = Column(Integer, default=1)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    user_achievements = relationship("UserAchievement", back_populates="achievement")

    def __repr__(self):
        return f"<Achievement(name='{self.name}', rarity='{self.rarity}')>"


class UserAchievement(Base):
    __tablename__ = "user_achievements"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    achievement_id = Column(UUID(as_uuid=True), ForeignKey("achievements.id"))
    
    # User context (for multi-user support in future)
    user_id = Column(String(100), default="default_user")
    
    # Earning details
    earned_at = Column(DateTime, default=datetime.utcnow)
    progress_value = Column(Float)
    notes = Column(Text)
    
    # Context of earning
    triggered_by_goal = Column(UUID(as_uuid=True), ForeignKey("goals.id"))
    triggered_by_session = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    
    # Relationships
    achievement = relationship("Achievement", back_populates="user_achievements")

    def __repr__(self):
        return f"<UserAchievement(achievement={self.achievement_id}, earned={self.earned_at})>"