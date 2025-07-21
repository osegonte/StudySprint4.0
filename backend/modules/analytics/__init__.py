# backend/modules/analytics/__init__.py
"""
StudySprint 4.0 - Analytics Module  
Stage 6: Comprehensive analytics engine with cross-module insights
"""

from .routes import router
from .models import (
    DailyStats, WeeklyTrends, PerformanceInsights, 
    LearningPathAnalysis, StudyEfficiencyMetrics
)
from .services import (
    AnalyticsService, DailyStatsService, 
    InsightsService, StudyEfficiencyService
)
from .schemas import (
    AnalyticsRequest, StudyAnalyticsSummary, TopicAnalytics,
    ComprehensiveAnalytics, AnalyticsDashboard, RealTimeMetrics,
    DailyStatsResponse, PerformanceInsightResponse
)

__all__ = [
    "router",
    "DailyStats",
    "WeeklyTrends", 
    "PerformanceInsights",
    "LearningPathAnalysis",
    "StudyEfficiencyMetrics",
    "AnalyticsService",
    "DailyStatsService",
    "InsightsService", 
    "StudyEfficiencyService",
    "AnalyticsRequest",
    "StudyAnalyticsSummary",
    "TopicAnalytics",
    "ComprehensiveAnalytics",
    "AnalyticsDashboard",
    "RealTimeMetrics",
    "DailyStatsResponse",
    "PerformanceInsightResponse"
]