# backend/modules/analytics/schemas.py
"""
StudySprint 4.0 - Analytics Module Schemas
Stage 6: Comprehensive analytics and cross-module insights
"""

from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class AnalyticsPeriod(str, Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"
    CUSTOM = "custom"


class InsightType(str, Enum):
    TREND = "trend"
    PATTERN = "pattern"
    RECOMMENDATION = "recommendation"
    WARNING = "warning"
    ACHIEVEMENT = "achievement"


class MetricCategory(str, Enum):
    FOCUS = "focus"
    PRODUCTIVITY = "productivity"
    CONSISTENCY = "consistency"
    GOALS = "goals"
    LEARNING = "learning"
    TIME_MANAGEMENT = "time_management"


# Daily Statistics Schemas
class DailyStatsBase(BaseModel):
    """Base schema for daily statistics"""
    stat_date: date
    total_study_minutes: int = 0
    active_study_minutes: int = 0
    break_minutes: int = 0
    idle_minutes: int = 0
    total_sessions: int = 0
    completed_sessions: int = 0
    pages_read: int = 0
    pdfs_completed: int = 0
    exercises_completed: int = 0
    notes_created: int = 0
    highlights_made: int = 0
    goals_worked_on: int = 0
    goals_completed: int = 0
    pomodoro_cycles: int = 0
    xp_earned: int = 0


class DailyStatsCreate(DailyStatsBase):
    """Schema for creating daily statistics"""
    user_id: str = "default_user"


class DailyStatsResponse(DailyStatsBase):
    """Schema for daily statistics response"""
    id: UUID
    user_id: str
    average_session_duration: float
    average_focus_score: float
    milestones_achieved: int
    pomodoro_effectiveness: float
    reading_speed_wpm: float
    comprehension_score: float
    productivity_score: float
    achievements_unlocked: int
    streak_days: int
    study_environments: List[str]
    peak_performance_hour: Optional[int] = None
    topic_breakdown: Dict[str, Any]
    session_breakdown: Dict[str, Any]
    goal_breakdown: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    # Computed properties
    efficiency_percentage: float
    focus_grade: str

    class Config:
        from_attributes = True


# Weekly Trends Schemas
class WeeklyTrendsResponse(BaseModel):
    """Schema for weekly trends response"""
    id: UUID
    year: int
    week_number: int
    start_date: date
    end_date: date
    user_id: str
    total_study_hours: float
    total_sessions: int
    total_pages: int
    total_exercises: int
    avg_daily_study_minutes: float
    avg_focus_score: float
    avg_productivity_score: float
    goals_progress: float
    completion_rate: float
    consistency_score: float
    study_time_change_pct: float
    focus_change_pct: float
    productivity_change_pct: float
    most_productive_day: Optional[str] = None
    best_study_time: Optional[str] = None
    top_topic: Optional[str] = None
    recommendations: List[str]
    improvement_areas: List[str]
    calculated_at: datetime

    class Config:
        from_attributes = True


# Performance Insights Schemas
class PerformanceInsightBase(BaseModel):
    """Base schema for performance insights"""
    insight_type: InsightType
    category: MetricCategory
    title: str = Field(..., min_length=1, max_length=255)
    description: str
    confidence_score: float = Field(..., ge=0.0, le=1.0)
    impact_score: float = Field(..., ge=0.0, le=1.0)
    is_actionable: bool = True
    action_items: List[str] = []
    estimated_improvement: Optional[str] = None


class PerformanceInsightCreate(PerformanceInsightBase):
    """Schema for creating performance insights"""
    user_id: str = "default_user"
    topic_id: Optional[UUID] = None
    goal_id: Optional[UUID] = None
    data_points: Dict[str, Any] = {}
    time_period_start: Optional[date] = None
    time_period_end: Optional[date] = None
    valid_until: Optional[date] = None


class PerformanceInsightResponse(PerformanceInsightBase):
    """Schema for performance insight response"""
    id: UUID
    user_id: str
    topic_id: Optional[UUID] = None
    goal_id: Optional[UUID] = None
    data_points: Dict[str, Any]
    time_period_start: Optional[date] = None
    time_period_end: Optional[date] = None
    valid_until: Optional[date] = None
    is_active: bool
    user_dismissed: bool
    user_acted_on: bool
    generated_at: datetime
    last_shown: Optional[datetime] = None
    
    # Computed property
    priority_score: float

    class Config:
        from_attributes = True


# Learning Path Analysis Schemas
class LearningPathAnalysisResponse(BaseModel):
    """Schema for learning path analysis response"""
    id: UUID
    user_id: str
    topic_id: Optional[UUID] = None
    current_level: Optional[str] = None
    estimated_mastery: float
    learning_velocity: float
    total_content_pages: int
    pages_completed: int
    average_comprehension: float
    difficulty_comfort_zone: float
    preferred_session_length: int
    optimal_study_times: List[str]
    best_environments: List[str]
    estimated_completion_weeks: Optional[int] = None
    next_milestone_date: Optional[date] = None
    proficiency_projection: Dict[str, Any]
    suggested_daily_minutes: Optional[int] = None
    recommended_next_topics: List[str]
    skill_gaps: List[str]
    strength_areas: List[str]
    prediction_confidence: float
    data_quality_score: float
    analyzed_at: datetime
    valid_until: Optional[datetime] = None

    class Config:
        from_attributes = True


# Study Efficiency Schemas
class StudyEfficiencyMetricsResponse(BaseModel):
    """Schema for study efficiency metrics response"""
    id: UUID
    measurement_date: date
    user_id: str
    topic_id: Optional[UUID] = None
    pages_per_hour: float
    concepts_mastered_per_hour: float
    retention_rate: float
    application_success_rate: float
    attention_span_minutes: float
    distraction_frequency: float
    deep_work_percentage: float
    cognitive_load_score: float
    optimal_difficulty_level: float
    challenge_comfort_ratio: float
    flow_state_frequency: float
    energy_efficiency: float
    environment_effectiveness: Dict[str, Any]
    time_of_day_performance: Dict[str, Any]
    session_length_optimization: Dict[str, Any]
    personal_benchmark_ratio: float
    peer_benchmark_ratio: float
    improvement_rate: float
    calculated_at: datetime

    class Config:
        from_attributes = True


# Analytics Request/Response Schemas
class AnalyticsRequest(BaseModel):
    """Schema for analytics requests"""
    period: AnalyticsPeriod = AnalyticsPeriod.WEEKLY
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    topic_id: Optional[UUID] = None
    goal_id: Optional[UUID] = None
    include_predictions: bool = True
    include_insights: bool = True
    metric_categories: List[MetricCategory] = []


class StudyAnalyticsSummary(BaseModel):
    """Schema for study analytics summary"""
    period_start: date
    period_end: date
    total_study_time_minutes: int
    total_sessions: int
    total_pages_read: int
    total_exercises_completed: int
    total_goals_worked: int
    total_xp_earned: int
    
    # Averages
    avg_daily_study_minutes: float
    avg_session_duration: float
    avg_focus_score: float
    avg_productivity_score: float
    avg_reading_speed: float
    
    # Efficiency metrics
    study_efficiency: float
    goal_completion_rate: float
    session_completion_rate: float
    consistency_score: float
    
    # Trends (compared to previous period)
    study_time_trend: float  # percentage change
    focus_trend: float
    productivity_trend: float
    efficiency_trend: float


class TopicAnalytics(BaseModel):
    """Schema for topic-specific analytics"""
    topic_id: UUID
    topic_name: str
    total_study_minutes: int
    completion_percentage: float
    mastery_level: str
    pages_read: int
    total_pages: int
    exercises_completed: int
    average_session_duration: float
    focus_score: float
    difficulty_rating: float
    time_to_mastery_estimate: Optional[int] = None  # weeks
    recommended_daily_minutes: int
    strengths: List[str]
    improvement_areas: List[str]


class GoalAnalyticsSummary(BaseModel):
    """Schema for goal analytics summary"""
    total_goals: int
    active_goals: int
    completed_goals: int
    overdue_goals: int
    completion_rate: float
    average_completion_time_days: float
    current_streak: int
    best_streak: int
    total_xp_earned: int
    goals_by_type: Dict[str, int]
    goals_by_priority: Dict[str, int]
    completion_rate_by_type: Dict[str, float]
    upcoming_deadlines: List[Dict[str, Any]]
    at_risk_goals: List[Dict[str, Any]]


class ProductivityInsight(BaseModel):
    """Schema for productivity insights"""
    insight_id: UUID
    title: str
    description: str
    category: MetricCategory
    impact_level: str  # high, medium, low
    confidence: float
    recommendations: List[str]
    data_visualization: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class PerformanceComparison(BaseModel):
    """Schema for performance comparisons"""
    metric_name: str
    current_value: float
    previous_value: float
    change_percentage: float
    trend_direction: str  # improving, declining, stable
    benchmark_value: Optional[float] = None
    percentile_rank: Optional[float] = None


class ComprehensiveAnalytics(BaseModel):
    """Schema for comprehensive analytics response"""
    summary: StudyAnalyticsSummary
    topic_analytics: List[TopicAnalytics]
    goal_analytics: GoalAnalyticsSummary
    insights: List[ProductivityInsight]
    performance_comparisons: List[PerformanceComparison]
    efficiency_metrics: StudyEfficiencyMetricsResponse
    learning_path: Optional[LearningPathAnalysisResponse] = None
    recommendations: List[str]
    generated_at: datetime


class AnalyticsDashboard(BaseModel):
    """Schema for analytics dashboard"""
    overview: StudyAnalyticsSummary
    daily_stats: List[DailyStatsResponse]
    weekly_trends: List[WeeklyTrendsResponse]
    top_insights: List[PerformanceInsightResponse]
    goal_progress: GoalAnalyticsSummary
    topic_breakdown: List[TopicAnalytics]
    efficiency_trends: List[float]  # Last 30 days
    focus_trends: List[float]       # Last 30 days
    productivity_heatmap: Dict[str, Any]  # Hour/day performance
    achievement_progress: Dict[str, Any]
    upcoming_milestones: List[Dict[str, Any]]


# Export and Reporting Schemas
class AnalyticsExportRequest(BaseModel):
    """Schema for analytics export requests"""
    export_format: str = Field("json", pattern="^(json|csv|pdf)$")
    include_raw_data: bool = False
    include_visualizations: bool = True
    period: AnalyticsPeriod = AnalyticsPeriod.MONTHLY
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    categories: List[MetricCategory] = []


class AnalyticsReport(BaseModel):
    """Schema for generated analytics reports"""
    report_id: UUID
    report_type: str
    generated_at: datetime
    period_covered: str
    summary: StudyAnalyticsSummary
    key_insights: List[str]
    recommendations: List[str]
    data_quality_score: float
    export_url: Optional[str] = None


# Real-time Analytics Schemas
class RealTimeMetrics(BaseModel):
    """Schema for real-time metrics"""
    current_session_id: Optional[UUID] = None
    active_time_today: int  # minutes
    focus_score_today: float
    pages_read_today: int
    goals_progress_today: float
    current_streak: int
    productivity_score: float
    estimated_completion_time: Optional[int] = None  # minutes
    next_milestone: Optional[str] = None
    live_recommendations: List[str]
    timestamp: datetime