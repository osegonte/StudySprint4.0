# backend/modules/goals/__init__.py
"""
StudySprint 4.0 - Goals Module
Stage 6: Comprehensive goal tracking with SMART goals and gamification
"""

from .routes import router
from .models import Goal, Milestone, GoalProgress, Achievement, UserAchievement
from .services import GoalService, MilestoneService, AchievementService
from .schemas import (
    GoalCreate, GoalUpdate, GoalResponse,
    MilestoneCreate, MilestoneResponse,
    GoalAnalytics, GoalDashboard
)

__all__ = [
    "router",
    "Goal",
    "Milestone", 
    "GoalProgress",
    "Achievement",
    "UserAchievement",
    "GoalService",
    "MilestoneService",
    "AchievementService",
    "GoalCreate",
    "GoalUpdate", 
    "GoalResponse",
    "MilestoneCreate",
    "MilestoneResponse",
    "GoalAnalytics",
    "GoalDashboard"
]