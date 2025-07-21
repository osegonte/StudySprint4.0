# backend/modules/goals/schemas.py
"""
StudySprint 4.0 - Goals Module Schemas
Stage 6: Comprehensive goal tracking with SMART goals validation
"""

from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Dict, Any
from datetime import datetime, date
from uuid import UUID
from enum import Enum


class GoalType(str, Enum):
    TIME_BASED = "time_based"
    COMPLETION = "completion"
    SKILL_BASED = "skill_based"
    PERFORMANCE = "performance"
    HABIT = "habit"
    PROJECT = "project"


class GoalStatus(str, Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"
    CANCELLED = "cancelled"
    OVERDUE = "overdue"


class GoalPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class MeasurableCriteria(BaseModel):
    """Schema for measurable criteria in SMART goals"""
    metric_name: str
    target_value: float
    current_value: float = 0.0
    unit: str  # hours, pages, exercises, percentage, etc.
    measurement_method: str


class GoalBase(BaseModel):
    """Base schema for Goal"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    goal_type: GoalType
    priority: GoalPriority = GoalPriority.MEDIUM
    
    # SMART criteria
    specific_description: str = Field(..., min_length=10)
    measurable_criteria: MeasurableCriteria
    achievable_plan: str = Field(..., min_length=10)
    relevant_reason: str = Field(..., min_length=10)
    time_bound_deadline: datetime
    
    # Associations
    topic_id: Optional[UUID] = None
    pdf_id: Optional[UUID] = None
    parent_goal_id: Optional[UUID] = None
    
    # Target and progress
    target_value: float = Field(..., gt=0)
    target_unit: str = Field(..., min_length=1)
    
    # Timeline
    target_date: datetime
    estimated_hours: Optional[int] = Field(None, ge=1, le=1000)
    
    # Settings
    difficulty_rating: int = Field(3, ge=1, le=5)
    importance_rating: int = Field(3, ge=1, le=5)
    motivation_notes: Optional[str] = None
    reward_description: Optional[str] = None
    reminder_frequency: str = Field("weekly", pattern="^(daily|weekly|custom)$")
    tags: List[str] = []

    @field_validator('time_bound_deadline', 'target_date')
    @classmethod
    def validate_future_date(cls, v):
        if v <= datetime.utcnow():
            raise ValueError('Deadline must be in the future')
        return v

    @field_validator('target_value')
    @classmethod
    def validate_target_value(cls, v):
        if v <= 0:
            raise ValueError('Target value must be positive')
        return v


class GoalCreate(GoalBase):
    """Schema for creating a new goal"""
    pass


class GoalUpdate(BaseModel):
    """Schema for updating goal"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    priority: Optional[GoalPriority] = None
    specific_description: Optional[str] = Field(None, min_length=10)
    achievable_plan: Optional[str] = Field(None, min_length=10)
    relevant_reason: Optional[str] = Field(None, min_length=10)
    time_bound_deadline: Optional[datetime] = None
    target_date: Optional[datetime] = None
    estimated_hours: Optional[int] = Field(None, ge=1, le=1000)
    difficulty_rating: Optional[int] = Field(None, ge=1, le=5)
    importance_rating: Optional[int] = Field(None, ge=1, le=5)
    motivation_notes: Optional[str] = None
    reward_description: Optional[str] = None
    reminder_frequency: Optional[str] = Field(None, pattern="^(daily|weekly|custom)$")
    tags: Optional[List[str]] = None


class GoalProgressUpdate(BaseModel):
    """Schema for updating goal progress"""
    new_value: float = Field(..., ge=0)
    activity_type: str = Field("manual", max_length=50)
    notes: Optional[str] = None
    session_id: Optional[UUID] = None


class GoalResponse(GoalBase):
    """Schema for goal response"""
    id: UUID
    status: GoalStatus
    current_value: float
    progress_percentage: float
    streak_count: int
    best_streak: int
    consistency_score: float
    last_activity_date: Optional[datetime] = None
    start_date: datetime
    completed_date: Optional[datetime] = None
    actual_hours: int
    xp_reward: int
    badges_earned: List[str]
    milestones_count: int
    sub_goals_count: int
    goal_metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime
    
    # Computed properties
    is_completed: bool
    is_overdue: bool
    days_remaining: Optional[int]
    completion_rate: float

    class Config:
        from_attributes = True


class MilestoneBase(BaseModel):
    """Base schema for Milestone"""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    target_percentage: float = Field(..., ge=0, le=100)
    order_sequence: int = Field(..., ge=1)
    xp_reward: int = Field(25, ge=0, le=1000)
    badge_name: Optional[str] = Field(None, max_length=100)
    celebration_message: Optional[str] = None


class MilestoneCreate(MilestoneBase):
    """Schema for creating a milestone"""
    goal_id: UUID


class MilestoneUpdate(BaseModel):
    """Schema for updating milestone"""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    target_percentage: Optional[float] = Field(None, ge=0, le=100)
    order_sequence: Optional[int] = Field(None, ge=1)
    xp_reward: Optional[int] = Field(None, ge=0, le=1000)
    badge_name: Optional[str] = Field(None, max_length=100)
    celebration_message: Optional[str] = None


class MilestoneResponse(MilestoneBase):
    """Schema for milestone response"""
    id: UUID
    goal_id: UUID
    target_value: Optional[float] = None
    is_completed: bool
    completed_date: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class AchievementBase(BaseModel):
    """Base schema for Achievement"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str = Field(..., min_length=1)
    category: str = Field(..., max_length=50)
    badge_icon: Optional[str] = Field(None, max_length=100)
    badge_color: str = Field("#FFD700", pattern="^#[0-9A-Fa-f]{6}$")
    criteria_type: str = Field(..., max_length=50)
    criteria_value: float = Field(..., ge=0)
    criteria_description: str
    xp_reward: int = Field(50, ge=0, le=10000)
    rarity: str = Field("common", pattern="^(common|rare|epic|legendary)$")
    unlock_level: int = Field(1, ge=1, le=100)


class AchievementCreate(AchievementBase):
    """Schema for creating achievement"""
    pass


class AchievementResponse(AchievementBase):
    """Schema for achievement response"""
    id: UUID
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class UserAchievementResponse(BaseModel):
    """Schema for user achievement response"""
    id: UUID
    achievement: AchievementResponse
    user_id: str
    earned_at: datetime
    progress_value: Optional[float] = None
    notes: Optional[str] = None
    triggered_by_goal: Optional[UUID] = None
    triggered_by_session: Optional[UUID] = None

    class Config:
        from_attributes = True


class GoalAnalytics(BaseModel):
    """Schema for goal analytics"""
    total_goals: int
    active_goals: int
    completed_goals: int
    overdue_goals: int
    completion_rate: float
    average_completion_time_days: float
    total_xp_earned: int
    current_streak: int
    best_streak: int
    
    # Performance metrics
    goals_by_type: Dict[str, int]
    goals_by_priority: Dict[str, int]
    goals_by_status: Dict[str, int]
    completion_rate_by_type: Dict[str, float]
    
    # Time analysis
    average_goal_duration: float
    most_productive_time: Optional[str] = None
    consistency_score: float
    
    # Insights
    top_achievement_categories: List[str]
    improvement_suggestions: List[str]
    next_milestones: List[MilestoneResponse]


class GoalList(BaseModel):
    """Schema for paginated goal list"""
    goals: List[GoalResponse]
    total: int
    active: int
    completed: int
    overdue: int
    page: int
    page_size: int
    total_pages: int


class GoalSearchParams(BaseModel):
    """Schema for goal search parameters"""
    status: Optional[GoalStatus] = None
    goal_type: Optional[GoalType] = None
    priority: Optional[GoalPriority] = None
    topic_id: Optional[UUID] = None
    is_overdue: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    page: int = Field(1, ge=1)
    page_size: int = Field(20, ge=1, le=100)
    sort_by: str = Field("created_at", pattern="^(created_at|target_date|progress_percentage|priority)$")
    sort_order: str = Field("desc", pattern="^(asc|desc)$")


class GoalRecommendation(BaseModel):
    """Schema for goal recommendations"""
    title: str
    description: str
    goal_type: GoalType
    estimated_difficulty: int
    estimated_duration_weeks: int
    related_topic_id: Optional[UUID] = None
    rationale: str
    confidence_score: float


class GoalInsight(BaseModel):
    """Schema for goal insights"""
    insight_type: str  # trend, pattern, recommendation, warning
    title: str
    description: str
    impact_level: str  # low, medium, high
    action_items: List[str]
    data_points: Dict[str, Any]
    expires_at: Optional[datetime] = None


# Bulk operations schemas
class BulkGoalCreate(BaseModel):
    """Schema for creating multiple goals"""
    goals: List[GoalCreate] = Field(..., min_items=1, max_items=50)
    create_default_milestones: bool = True


class BulkGoalUpdate(BaseModel):
    """Schema for updating multiple goals"""
    goal_ids: List[UUID] = Field(..., min_items=1, max_items=100)
    updates: GoalUpdate


class BulkGoalResponse(BaseModel):
    """Schema for bulk goal operation response"""
    successful: List[UUID]
    failed: List[Dict[str, Any]]
    total_processed: int
    success_count: int
    failure_count: int


# Goal template schemas
class GoalTemplate(BaseModel):
    """Schema for goal templates"""
    name: str
    description: str
    goal_type: GoalType
    template_data: GoalBase
    default_milestones: List[MilestoneBase]
    category: str
    difficulty_level: int
    estimated_duration_weeks: int
    success_rate: float


class GoalTemplateResponse(GoalTemplate):
    """Schema for goal template response"""
    id: UUID
    usage_count: int
    average_success_rate: float
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard schemas
class GoalDashboard(BaseModel):
    """Schema for goal dashboard overview"""
    summary: GoalAnalytics
    active_goals: List[GoalResponse]
    upcoming_deadlines: List[GoalResponse]
    recent_achievements: List[UserAchievementResponse]
    pending_milestones: List[MilestoneResponse]
    insights: List[GoalInsight]
    recommendations: List[GoalRecommendation]
    streaks: Dict[str, int]
    weekly_progress: Dict[str, float]


# Progress tracking schemas
class GoalProgressHistory(BaseModel):
    """Schema for goal progress history"""
    goal_id: UUID
    progress_logs: List[Dict[str, Any]]
    milestones_achieved: List[MilestoneResponse]
    trend_analysis: Dict[str, Any]
    velocity_metrics: Dict[str, float]
    projected_completion: Optional[datetime] = None


class StreakInfo(BaseModel):
    """Schema for streak information"""
    current_streak: int
    best_streak: int
    streak_type: str  # daily, weekly, monthly
    last_activity: datetime
    next_milestone: Optional[int] = None
    streak_multiplier: float = 1.0