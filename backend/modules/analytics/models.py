# backend/modules/analytics/models.py
"""
StudySprint 4.0 - Analytics Module Models
Stage 6: Comprehensive analytics and insights across all modules
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL, Date
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime, date
from common.database import Base


class DailyStats(Base):
    __tablename__ = "daily_stats"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Date and context
    stat_date = Column(Date, nullable=False, index=True)
    user_id = Column(String(100), default="default_user")
    
    # Study time metrics
    total_study_minutes = Column(Integer, default=0)
    active_study_minutes = Column(Integer, default=0)
    break_minutes = Column(Integer, default=0)
    idle_minutes = Column(Integer, default=0)
    
    # Session metrics
    total_sessions = Column(Integer, default=0)
    completed_sessions = Column(Integer, default=0)
    average_session_duration = Column(Float, default=0.0)
    average_focus_score = Column(DECIMAL(5,2), default=0.0)
    
    # Content progress
    pages_read = Column(Integer, default=0)
    pdfs_completed = Column(Integer, default=0)
    exercises_completed = Column(Integer, default=0)
    notes_created = Column(Integer, default=0)
    highlights_made = Column(Integer, default=0)
    
    # Goal progress
    goals_worked_on = Column(Integer, default=0)
    goals_completed = Column(Integer, default=0)
    milestones_achieved = Column(Integer, default=0)
    
    # Pomodoro tracking
    pomodoro_cycles = Column(Integer, default=0)
    pomodoro_effectiveness = Column(DECIMAL(3,2), default=0.0)
    
    # Performance metrics
    reading_speed_wpm = Column(DECIMAL(5,2), default=0.0)
    comprehension_score = Column(DECIMAL(3,2), default=0.0)
    productivity_score = Column(DECIMAL(5,2), default=0.0)
    
    # Gamification
    xp_earned = Column(Integer, default=0)
    achievements_unlocked = Column(Integer, default=0)
    streak_days = Column(Integer, default=0)
    
    # Environmental factors
    study_environments = Column(ARRAY(String))  # home, library, cafe, etc.
    peak_performance_hour = Column(Integer)     # 0-23
    
    # Detailed breakdown
    topic_breakdown = Column(JSON, default={})     # time per topic
    session_breakdown = Column(JSON, default={})   # session types and durations
    goal_breakdown = Column(JSON, default={})      # progress per goal
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<DailyStats(date={self.stat_date}, study_time={self.total_study_minutes}min)>"

    @property
    def efficiency_percentage(self):
        """Calculate study efficiency as active/total time"""
        if self.total_study_minutes == 0:
            return 0.0
        return (self.active_study_minutes / self.total_study_minutes) * 100

    @property
    def focus_grade(self):
        """Convert focus score to letter grade"""
        score = float(self.average_focus_score) if self.average_focus_score else 0
        if score >= 90: return "A"
        elif score >= 80: return "B"
        elif score >= 70: return "C"
        elif score >= 60: return "D"
        else: return "F"


class WeeklyTrends(Base):
    __tablename__ = "weekly_trends"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Week identification
    year = Column(Integer, nullable=False)
    week_number = Column(Integer, nullable=False)  # 1-53
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    user_id = Column(String(100), default="default_user")
    
    # Aggregated metrics
    total_study_hours = Column(DECIMAL(5,2), default=0.0)
    total_sessions = Column(Integer, default=0)
    total_pages = Column(Integer, default=0)
    total_exercises = Column(Integer, default=0)
    
    # Averages and trends
    avg_daily_study_minutes = Column(DECIMAL(5,2), default=0.0)
    avg_focus_score = Column(DECIMAL(5,2), default=0.0)
    avg_productivity_score = Column(DECIMAL(5,2), default=0.0)
    
    # Progress metrics
    goals_progress = Column(DECIMAL(5,2), default=0.0)
    completion_rate = Column(DECIMAL(5,2), default=0.0)
    consistency_score = Column(DECIMAL(5,2), default=0.0)
    
    # Comparison to previous week
    study_time_change_pct = Column(DECIMAL(5,2), default=0.0)
    focus_change_pct = Column(DECIMAL(5,2), default=0.0)
    productivity_change_pct = Column(DECIMAL(5,2), default=0.0)
    
    # Insights
    most_productive_day = Column(String(10))
    best_study_time = Column(String(20))
    top_topic = Column(String(255))
    
    # Recommendations
    recommendations = Column(ARRAY(String))
    improvement_areas = Column(ARRAY(String))
    
    # Timestamps
    calculated_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<WeeklyTrends(year={self.year}, week={self.week_number}, hours={self.total_study_hours})>"


class PerformanceInsights(Base):
    __tablename__ = "performance_insights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Insight metadata
    insight_type = Column(String(50), nullable=False)  # trend, pattern, recommendation, achievement
    category = Column(String(50), nullable=False)      # focus, productivity, consistency, goals
    title = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Context
    user_id = Column(String(100), default="default_user")
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    goal_id = Column(UUID(as_uuid=True), ForeignKey("goals.id"))
    
    # Data supporting the insight
    data_points = Column(JSON, default={})
    confidence_score = Column(DECIMAL(3,2), default=0.0)  # How confident we are in this insight
    impact_score = Column(DECIMAL(3,2), default=0.0)     # How impactful this insight could be
    
    # Actionability
    is_actionable = Column(Boolean, default=False)
    action_items = Column(ARRAY(String))
    estimated_improvement = Column(String(100))  # "15% better focus", "2 hours/week saved"
    
    # Timeline
    time_period_start = Column(Date)
    time_period_end = Column(Date)
    valid_until = Column(Date)  # When this insight expires
    
    # Status
    is_active = Column(Boolean, default=True)
    user_dismissed = Column(Boolean, default=False)
    user_acted_on = Column(Boolean, default=False)
    
    # Timestamps
    generated_at = Column(DateTime, default=datetime.utcnow)
    last_shown = Column(DateTime)

    def __repr__(self):
        return f"<PerformanceInsights(type='{self.insight_type}', title='{self.title[:30]}...')>"

    @property
    def priority_score(self):
        """Calculate priority based on confidence and impact"""
        if not self.confidence_score or not self.impact_score:
            return 0.0
        return float(self.confidence_score) * float(self.impact_score)


class LearningPathAnalysis(Base):
    __tablename__ = "learning_path_analysis"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Path identification
    user_id = Column(String(100), default="default_user")
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    
    # Learning progression
    current_level = Column(String(20))  # beginner, intermediate, advanced, expert
    estimated_mastery = Column(DECIMAL(5,2), default=0.0)  # 0-100%
    learning_velocity = Column(DECIMAL(5,2), default=0.0)  # pages/hours per week
    
    # Content analysis
    total_content_pages = Column(Integer, default=0)
    pages_completed = Column(Integer, default=0)
    average_comprehension = Column(DECIMAL(3,2), default=0.0)
    difficulty_comfort_zone = Column(DECIMAL(3,2), default=0.0)
    
    # Study patterns
    preferred_session_length = Column(Integer, default=60)  # minutes
    optimal_study_times = Column(ARRAY(String))  # ["09:00-11:00", "14:00-16:00"]
    best_environments = Column(ARRAY(String))
    
    # Predictions
    estimated_completion_weeks = Column(Integer)
    next_milestone_date = Column(Date)
    proficiency_projection = Column(JSON, default={})  # weekly proficiency predictions
    
    # Recommendations
    suggested_daily_minutes = Column(Integer)
    recommended_next_topics = Column(ARRAY(String))
    skill_gaps = Column(ARRAY(String))
    strength_areas = Column(ARRAY(String))
    
    # Confidence metrics
    prediction_confidence = Column(DECIMAL(3,2), default=0.0)
    data_quality_score = Column(DECIMAL(3,2), default=0.0)
    
    # Timestamps
    analyzed_at = Column(DateTime, default=datetime.utcnow)
    valid_until = Column(DateTime)

    def __repr__(self):
        return f"<LearningPathAnalysis(topic={self.topic_id}, level='{self.current_level}', mastery={self.estimated_mastery}%)>"


class PredictiveModels(Base):
    __tablename__ = "predictive_models"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Model metadata
    model_name = Column(String(100), nullable=False)
    model_type = Column(String(50), nullable=False)  # completion_time, performance, retention
    version = Column(String(20), default="1.0")
    
    # Model parameters
    feature_set = Column(ARRAY(String))  # which features the model uses
    training_period_days = Column(Integer, default=30)
    min_data_points = Column(Integer, default=10)
    
    # Performance metrics
    accuracy_score = Column(DECIMAL(5,2), default=0.0)
    precision_score = Column(DECIMAL(5,2), default=0.0)
    recall_score = Column(DECIMAL(5,2), default=0.0)
    f1_score = Column(DECIMAL(5,2), default=0.0)
    
    # Model state
    is_active = Column(Boolean, default=True)
    last_trained = Column(DateTime)
    last_validated = Column(DateTime)
    training_data_count = Column(Integer, default=0)
    
    # Model artifacts
    model_parameters = Column(JSON, default={})
    feature_importance = Column(JSON, default={})
    validation_results = Column(JSON, default={})
    
    # Usage tracking
    prediction_count = Column(Integer, default=0)
    last_prediction = Column(DateTime)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f"<PredictiveModels(name='{self.model_name}', accuracy={self.accuracy_score}%)>"


class StudyEfficiencyMetrics(Base):
    __tablename__ = "study_efficiency_metrics"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Temporal context
    measurement_date = Column(Date, nullable=False)
    user_id = Column(String(100), default="default_user")
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id"))
    
    # Efficiency measurements
    pages_per_hour = Column(DECIMAL(5,2), default=0.0)
    concepts_mastered_per_hour = Column(DECIMAL(5,2), default=0.0)
    retention_rate = Column(DECIMAL(5,2), default=0.0)
    application_success_rate = Column(DECIMAL(5,2), default=0.0)
    
    # Focus and attention metrics
    attention_span_minutes = Column(DECIMAL(5,2), default=0.0)
    distraction_frequency = Column(DECIMAL(5,2), default=0.0)
    deep_work_percentage = Column(DECIMAL(5,2), default=0.0)
    cognitive_load_score = Column(DECIMAL(3,2), default=0.0)
    
    # Learning optimization
    optimal_difficulty_level = Column(DECIMAL(3,2), default=0.0)
    challenge_comfort_ratio = Column(DECIMAL(3,2), default=0.0)
    flow_state_frequency = Column(DECIMAL(3,2), default=0.0)
    energy_efficiency = Column(DECIMAL(3,2), default=0.0)
    
    # Environmental factors
    environment_effectiveness = Column(JSON, default={})  # effectiveness by environment
    time_of_day_performance = Column(JSON, default={})    # performance by hour
    session_length_optimization = Column(JSON, default={})  # effectiveness by duration
    
    # Comparative analysis
    personal_benchmark_ratio = Column(DECIMAL(3,2), default=1.0)  # compared to personal average
    peer_benchmark_ratio = Column(DECIMAL(3,2), default=1.0)      # compared to similar learners
    improvement_rate = Column(DECIMAL(5,2), default=0.0)          # % improvement over time
    
    # Timestamps
    calculated_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<StudyEfficiencyMetrics(date={self.measurement_date}, pages/hr={self.pages_per_hour})>"