# backend/modules/analytics/services.py
"""
StudySprint 4.0 - Enhanced Analytics Service
Stage 6 Complete: Comprehensive analytics and insights
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
from sqlalchemy import func
from modules.sessions.models import StudySession
from modules.pdfs.models import PDF
from modules.topics.models import Topic
from modules.goals.models import Goal

logger = logging.getLogger(__name__)

class AnalyticsService:
    """Enhanced analytics service with comprehensive insights"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_dashboard_data(self) -> Dict[str, Any]:
        """Get comprehensive dashboard data"""
        
        # Study Sessions
        total_study_time = self.db.query(func.sum(StudySession.total_minutes)).scalar() or 0
        total_sessions = self.db.query(func.count(StudySession.id)).scalar() or 0
        avg_focus_score = self.db.query(func.avg(StudySession.focus_score)).scalar() or 0
        avg_productivity = self.db.query(func.avg(StudySession.productivity_score)).scalar() or 0
        # Weekly study hours (last 7 days)
        week_ago = datetime.utcnow() - timedelta(days=7)
        weekly_minutes = self.db.query(func.sum(StudySession.total_minutes)).filter(StudySession.start_time >= week_ago).scalar() or 0
        weekly_study_hours = round(weekly_minutes / 60, 2)
        # Consistency: days with sessions in last 7 days
        days_with_sessions = self.db.query(func.date(StudySession.start_time)).filter(StudySession.start_time >= week_ago).distinct().count()
        consistency_score = round((days_with_sessions / 7) * 100, 2)

        # Goals
        total_goals = self.db.query(func.count(Goal.id)).scalar() or 0
        active_goals = self.db.query(func.count(Goal.id)).filter(Goal.status == 'active').scalar() or 0
        completed_goals = self.db.query(func.count(Goal.id)).filter(Goal.status == 'completed').scalar() or 0
        total_xp = self.db.query(func.sum(Goal.xp_reward)).scalar() or 0

        # Achievements (placeholder: count completed goals as achievements)
        total_achievements = completed_goals

        # Quick stats (today)
        today = datetime.utcnow().date()
        today_minutes = self.db.query(func.sum(StudySession.total_minutes)).filter(func.date(StudySession.start_time) == today).scalar() or 0
        today_goals_progress = self.db.query(func.count(Goal.id)).filter(Goal.status == 'completed', func.date(Goal.updated_at) == today).scalar() or 0
        week_completion_rate = round((completed_goals / total_goals) * 100, 2) if total_goals else 0
        current_streak = days_with_sessions

        return {
            "overview": {
                "goals": {
                    "total_goals": total_goals,
                    "active_goals": active_goals,
                    "completed_goals": completed_goals,
                    "total_xp": total_xp
                },
                "study": {
                    "total_study_time_minutes": total_study_time,
                    "total_sessions": total_sessions,
                    "avg_focus_score": round(avg_focus_score, 2),
                    "productivity_score": round(avg_productivity, 2),
                    "weekly_study_hours": [weekly_study_hours],
                    "consistency_score": consistency_score
                },
                "achievements": {
                    "total_earned": total_achievements,
                    "total_xp": total_xp
                }
            },
            "performance": {},  # Can be filled with more detailed trends if needed
            "insights": [],     # Can be filled with more advanced logic
            "quick_stats": {
                "today_study_time": today_minutes,
                "today_goals_progress": today_goals_progress,
                "week_completion_rate": week_completion_rate,
                "current_streak": current_streak
            }
        }
    
    def get_performance_analytics(self, period: str = "week") -> Dict[str, Any]:
        """Get detailed performance analytics"""
        
        now = datetime.utcnow()
        if period == "week":
            start = now - timedelta(days=7)
        elif period == "month":
            start = now - timedelta(days=30)
        else:
            start = now - timedelta(days=1)
        sessions = self.db.query(StudySession).filter(StudySession.start_time >= start).all()
        study_minutes = [s.total_minutes for s in sessions]
        focus_scores = [float(s.focus_score or 0) for s in sessions]
        return {
            "period": period,
            "study_minutes": study_minutes,
            "focus_scores": focus_scores,
            "performance_score": round(sum(study_minutes) / len(study_minutes), 2) if study_minutes else 0,
            "insights": []
        }
    
    def _generate_dashboard_insights(self, goals_data: List, study_analytics: Dict) -> List[str]:
        """Generate personalized dashboard insights"""
        insights = []
        
        if not goals_data:
            insights.append("🎯 Create your first goal to start tracking progress!")
        else:
            active_goals = len([g for g in goals_data if g["status"] == "active"])
            completed_goals = len([g for g in goals_data if g["status"] == "completed"])
            
            if completed_goals > 0:
                insights.append(f"🏆 Great job! You've completed {completed_goals} goals.")
            
            if active_goals > 5:
                insights.append("📝 Consider focusing on fewer goals for better success rates.")
            
            if study_analytics["avg_focus_score"] > 85:
                insights.append("🧠 Excellent focus levels! You're in the zone.")
            
            if study_analytics["consistency_score"] > 85:
                insights.append("📈 Outstanding consistency! Keep up the great routine.")
        
        return insights[:4]
    
    def _generate_performance_insights(self, performance_score: float) -> List[str]:
        """Generate performance-specific insights"""
        insights = []
        
        if performance_score > 110:
            insights.append("🚀 Exceeding your study targets! Outstanding dedication.")
        elif performance_score > 90:
            insights.append("✨ Meeting your study goals consistently!")
        else:
            insights.append("📈 Focus on reaching your daily study time targets.")
        
        insights.append("💡 Try the Pomodoro technique for better focus.")
        insights.append("🎯 Align study time with your most important goals.")
        
        return insights
