# backend/modules/analytics/services.py
"""
StudySprint 4.0 - Analytics Module Services
Stage 6: Comprehensive analytics engine with cross-module insights
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta, date
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, text
import logging
import statistics
from collections import defaultdict

from common.database import Topic, PDF
from modules.sessions.models import StudySession, PageTime, ReadingSpeed
from modules.exercises.models import Exercise, ExerciseAttempt
from modules.notes.models import Note, Highlight
from modules.goals.models import Goal, GoalProgress

from .models import (
    DailyStats, WeeklyTrends, PerformanceInsights, 
    LearningPathAnalysis, StudyEfficiencyMetrics
)
from .schemas import (
    DailyStatsResponse, WeeklyTrendsResponse, PerformanceInsightResponse,
    LearningPathAnalysisResponse, StudyEfficiencyMetricsResponse,
    StudyAnalyticsSummary, TopicAnalytics, ComprehensiveAnalytics,
    AnalyticsDashboard, RealTimeMetrics
)

logger = logging.getLogger(__name__)


class AnalyticsService:
    """Master analytics service for cross-module insights"""
    
    def __init__(self, db: Session):
        self.db = db
        self.daily_stats_service = DailyStatsService(db)
        self.insights_service = InsightsService(db)
        self.efficiency_service = StudyEfficiencyService(db)
    
    def get_comprehensive_analytics(self, 
                                  start_date: Optional[date] = None,
                                  end_date: Optional[date] = None) -> ComprehensiveAnalytics:
        """Generate comprehensive analytics across all modules"""
        
        if not start_date:
            start_date = datetime.utcnow().date() - timedelta(days=30)
        if not end_date:
            end_date = datetime.utcnow().date()
        
        # Generate summary
        summary = self._generate_study_analytics_summary(start_date, end_date)
        
        # Get topic analytics
        topic_analytics = self._get_all_topic_analytics()
        
        # Get goal analytics (if goals module available)
        goal_analytics = self._get_goal_analytics_summary()
        
        # Get insights
        insights = self.insights_service.generate_performance_insights(start_date, end_date)
        
        # Get performance comparisons
        comparisons = self._generate_performance_comparisons(start_date, end_date)
        
        # Get efficiency metrics
        efficiency = self.efficiency_service.get_latest_efficiency_metrics()
        
        # Generate recommendations
        recommendations = self._generate_recommendations(summary, topic_analytics)
        
        return ComprehensiveAnalytics(
            summary=summary,
            topic_analytics=topic_analytics,
            goal_analytics=goal_analytics,
            insights=insights[:5],  # Top 5 insights
            performance_comparisons=comparisons,
            efficiency_metrics=efficiency,
            learning_path=None,  # Would be generated for specific topics
            recommendations=recommendations,
            generated_at=datetime.utcnow()
        )
    
    def get_analytics_dashboard(self) -> AnalyticsDashboard:
        """Get complete analytics dashboard"""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=30)
        
        # Overview
        overview = self._generate_study_analytics_summary(start_date, end_date)
        
        # Daily stats for last 30 days
        daily_stats = self.daily_stats_service.get_daily_stats_range(start_date, end_date)
        
        # Weekly trends for last 12 weeks
        weekly_start = end_date - timedelta(weeks=12)
        weekly_trends = self._get_weekly_trends(weekly_start, end_date)
        
        # Top insights
        top_insights = self.insights_service.get_active_insights(limit=5)
        
        # Goal progress
        goal_progress = self._get_goal_analytics_summary()
        
        # Topic breakdown
        topic_breakdown = self._get_all_topic_analytics()
        
        # Efficiency and focus trends (last 30 days)
        efficiency_trends, focus_trends = self._get_trend_data(start_date, end_date)
        
        # Productivity heatmap
        productivity_heatmap = self._generate_productivity_heatmap()
        
        # Achievement progress
        achievement_progress = self._get_achievement_progress()
        
        # Upcoming milestones
        upcoming_milestones = self._get_upcoming_milestones()
        
        return AnalyticsDashboard(
            overview=overview,
            daily_stats=daily_stats,
            weekly_trends=weekly_trends,
            top_insights=top_insights,
            goal_progress=goal_progress,
            topic_breakdown=topic_breakdown,
            efficiency_trends=efficiency_trends,
            focus_trends=focus_trends,
            productivity_heatmap=productivity_heatmap,
            achievement_progress=achievement_progress,
            upcoming_milestones=upcoming_milestones
        )
    
    def get_real_time_metrics(self, user_id: str = "default_user") -> RealTimeMetrics:
        """Get real-time study metrics"""
        today = datetime.utcnow().date()
        
        # Get today's stats
        today_stats = self.daily_stats_service.get_or_create_daily_stats(today, user_id)
        
        # Current session info
        current_session = self.db.query(StudySession).filter(
            StudySession.end_time.is_(None)
        ).first()
        
        # Current streak
        current_streak = self._calculate_current_streak(user_id)
        
        # Productivity score (based on recent activity)
        productivity_score = self._calculate_current_productivity()
        
        # Next milestone
        next_milestone = self._get_next_milestone()
        
        # Live recommendations
        recommendations = self._generate_live_recommendations(today_stats, current_session)
        
        return RealTimeMetrics(
            current_session_id=current_session.id if current_session else None,
            active_time_today=today_stats.active_study_minutes,
            focus_score_today=float(today_stats.average_focus_score),
            pages_read_today=today_stats.pages_read,
            goals_progress_today=self._calculate_daily_goal_progress(),
            current_streak=current_streak,
            productivity_score=productivity_score,
            estimated_completion_time=self._estimate_session_completion(),
            next_milestone=next_milestone,
            live_recommendations=recommendations,
            timestamp=datetime.utcnow()
        )
    
    # Private helper methods
    
    def _generate_study_analytics_summary(self, start_date: date, end_date: date) -> StudyAnalyticsSummary:
        """Generate study analytics summary for date range"""
        
        # Get all sessions in range
        sessions = self.db.query(StudySession).filter(
            and_(
                StudySession.start_time >= datetime.combine(start_date, datetime.min.time()),
                StudySession.start_time <= datetime.combine(end_date, datetime.max.time()),
                StudySession.end_time.isnot(None)
            )
        ).all()
        
        if not sessions:
            return StudyAnalyticsSummary(
                period_start=start_date,
                period_end=end_date,
                total_study_time_minutes=0,
                total_sessions=0,
                total_pages_read=0,
                total_exercises_completed=0,
                total_goals_worked=0,
                total_xp_earned=0,
                avg_daily_study_minutes=0.0,
                avg_session_duration=0.0,
                avg_focus_score=0.0,
                avg_productivity_score=0.0,
                avg_reading_speed=0.0,
                study_efficiency=0.0,
                goal_completion_rate=0.0,
                session_completion_rate=0.0,
                consistency_score=0.0,
                study_time_trend=0.0,
                focus_trend=0.0,
                productivity_trend=0.0,
                efficiency_trend=0.0
            )
        
        # Calculate basic metrics
        total_study_time = sum(s.total_minutes for s in sessions)
        total_sessions = len(sessions)
        total_pages = sum(s.pages_completed for s in sessions)
        total_xp = sum(s.xp_earned for s in sessions)
        
        # Exercises completed in period
        exercise_attempts = self.db.query(ExerciseAttempt).filter(
            and_(
                ExerciseAttempt.attempted_at >= datetime.combine(start_date, datetime.min.time()),
                ExerciseAttempt.attempted_at <= datetime.combine(end_date, datetime.max.time()),
                ExerciseAttempt.is_correct == True
            )
        ).count()
        
        # Goals worked on
        goals_worked = self.db.query(Goal).filter(
            and_(
                Goal.last_activity_date >= datetime.combine(start_date, datetime.min.time()),
                Goal.last_activity_date <= datetime.combine(end_date, datetime.max.time())
            )
        ).count()
        
        # Calculate averages
        days_in_period = (end_date - start_date).days + 1
        avg_daily_minutes = total_study_time / days_in_period if days_in_period > 0 else 0
        avg_session_duration = total_study_time / total_sessions if total_sessions > 0 else 0
        
        # Focus and productivity scores
        focus_scores = [float(s.focus_score) for s in sessions if s.focus_score]
        productivity_scores = [float(s.productivity_score) for s in sessions if s.productivity_score]
        avg_focus = statistics.mean(focus_scores) if focus_scores else 0
        avg_productivity = statistics.mean(productivity_scores) if productivity_scores else 0
        
        # Reading speed
        reading_speeds = self.db.query(ReadingSpeed).filter(
            and_(
                ReadingSpeed.calculated_at >= datetime.combine(start_date, datetime.min.time()),
                ReadingSpeed.calculated_at <= datetime.combine(end_date, datetime.max.time())
            )
        ).all()
        avg_reading_speed = statistics.mean([float(rs.words_per_minute) for rs in reading_speeds if rs.words_per_minute]) if reading_speeds else 0
        
        # Efficiency metrics
        total_active_minutes = sum(s.active_minutes for s in sessions)
        study_efficiency = (total_active_minutes / total_study_time * 100) if total_study_time > 0 else 0
        
        # Goal completion rate
        total_goals = self.db.query(Goal).count()
        completed_goals = self.db.query(Goal).filter(Goal.status == "completed").count()
        goal_completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
        
        # Session completion rate
        planned_sessions = len([s for s in sessions if s.planned_duration_minutes])
        completed_sessions = len([s for s in sessions if s.total_minutes >= s.planned_duration_minutes])
        session_completion_rate = (completed_sessions / planned_sessions * 100) if planned_sessions > 0 else 0
        
        # Consistency score (days with study activity)
        study_days = len(set(s.start_time.date() for s in sessions))
        consistency_score = (study_days / days_in_period * 100) if days_in_period > 0 else 0
        
        # Trends (compare with previous period)
        prev_start = start_date - timedelta(days=days_in_period)
        prev_end = start_date - timedelta(days=1)
        prev_summary = self._get_previous_period_summary(prev_start, prev_end)
        
        study_time_trend = self._calculate_trend(total_study_time, prev_summary.get('total_study_time', 0))
        focus_trend = self._calculate_trend(avg_focus, prev_summary.get('avg_focus', 0))
        productivity_trend = self._calculate_trend(avg_productivity, prev_summary.get('avg_productivity', 0))
        efficiency_trend = self._calculate_trend(study_efficiency, prev_summary.get('study_efficiency', 0))
        
        return StudyAnalyticsSummary(
            period_start=start_date,
            period_end=end_date,
            total_study_time_minutes=total_study_time,
            total_sessions=total_sessions,
            total_pages_read=total_pages,
            total_exercises_completed=exercise_attempts,
            total_goals_worked=goals_worked,
            total_xp_earned=total_xp,
            avg_daily_study_minutes=avg_daily_minutes,
            avg_session_duration=avg_session_duration,
            avg_focus_score=avg_focus,
            avg_productivity_score=avg_productivity,
            avg_reading_speed=avg_reading_speed,
            study_efficiency=study_efficiency,
            goal_completion_rate=goal_completion_rate,
            session_completion_rate=session_completion_rate,
            consistency_score=consistency_score,
            study_time_trend=study_time_trend,
            focus_trend=focus_trend,
            productivity_trend=productivity_trend,
            efficiency_trend=efficiency_trend
        )
    
    def _get_all_topic_analytics(self) -> List[TopicAnalytics]:
        """Get analytics for all topics"""
        topics = self.db.query(Topic).filter(Topic.is_archived == False).all()
        analytics = []
        
        for topic in topics:
            topic_analytics = self._get_topic_analytics(topic.id)
            analytics.append(topic_analytics)
        
        return analytics
    
    def _get_topic_analytics(self, topic_id: UUID) -> TopicAnalytics:
        """Get analytics for a specific topic"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        
        # Get topic sessions
        sessions = self.db.query(StudySession).filter(
            and_(
                StudySession.topic_id == topic_id,
                StudySession.end_time.isnot(None)
            )
        ).all()
        
        # Get topic PDFs
        pdfs = self.db.query(PDF).filter(PDF.topic_id == topic_id).all()
        
        # Calculate metrics
        total_study_minutes = sum(s.total_minutes for s in sessions)
        total_pages = sum(p.total_pages for p in pdfs if p.total_pages)
        pages_read = sum(p.current_page for p in pdfs if p.current_page)
        completion_percentage = float(topic.study_progress) if topic.study_progress else 0.0
        
        # Exercises completed
        topic_exercises = self.db.query(Exercise).filter(Exercise.topic_id == topic_id).all()
        exercise_ids = [e.id for e in topic_exercises]
        exercises_completed = self.db.query(ExerciseAttempt).filter(
            and_(
                ExerciseAttempt.exercise_id.in_(exercise_ids),
                ExerciseAttempt.is_correct == True
            )
        ).count()
        
        # Session metrics
        avg_session_duration = statistics.mean([s.total_minutes for s in sessions]) if sessions else 0
        focus_scores = [float(s.focus_score) for s in sessions if s.focus_score]
        avg_focus_score = statistics.mean(focus_scores) if focus_scores else 0
        
        # Difficulty and mastery
        difficulty_rating = topic.difficulty_level
        mastery_level = "beginner"
        if completion_percentage >= 75:
            mastery_level = "advanced"
        elif completion_percentage >= 50:
            mastery_level = "intermediate"
        elif completion_percentage >= 25:
            mastery_level = "novice"
        
        # Time estimates
        remaining_pages = max(0, total_pages - pages_read)
        avg_reading_speed = 250  # words per minute assumption
        words_per_page = 250  # assumption
        time_to_mastery_estimate = int((remaining_pages * words_per_page) / avg_reading_speed / 60) if remaining_pages > 0 else None
        
        # Recommendations
        recommended_daily_minutes = min(120, max(30, total_study_minutes // 10)) if total_study_minutes > 0 else 60
        
        # Strengths and improvement areas
        strengths = []
        improvement_areas = []
        
        if avg_focus_score >= 80:
            strengths.append("High focus during study sessions")
        elif avg_focus_score < 60:
            improvement_areas.append("Focus and concentration")
        
        if completion_percentage >= 75:
            strengths.append("Consistent progress")
        elif completion_percentage < 25:
            improvement_areas.append("Study consistency")
        
        if exercises_completed >= 10:
            strengths.append("Active practice and testing")
        else:
            improvement_areas.append("More practice exercises needed")
        
        return TopicAnalytics(
            topic_id=topic_id,
            topic_name=topic.name,
            total_study_minutes=total_study_minutes,
            completion_percentage=completion_percentage,
            mastery_level=mastery_level,
            pages_read=pages_read,
            total_pages=total_pages,
            exercises_completed=exercises_completed,
            average_session_duration=avg_session_duration,
            focus_score=avg_focus_score,
            difficulty_rating=difficulty_rating,
            time_to_mastery_estimate=time_to_mastery_estimate,
            recommended_daily_minutes=recommended_daily_minutes,
            strengths=strengths,
            improvement_areas=improvement_areas
        )
    
    def _get_goal_analytics_summary(self):
        """Get goal analytics summary"""
        try:
            total_goals = self.db.query(Goal).count()
            active_goals = self.db.query(Goal).filter(Goal.status == "active").count()
            completed_goals = self.db.query(Goal).filter(Goal.status == "completed").count()
            overdue_goals = self.db.query(Goal).filter(
                and_(
                    Goal.target_date < datetime.utcnow(),
                    Goal.status != "completed"
                )
            ).count()
            
            completion_rate = (completed_goals / total_goals * 100) if total_goals > 0 else 0
            
            # Average completion time
            completed = self.db.query(Goal).filter(
                and_(
                    Goal.status == "completed",
                    Goal.completed_date.isnot(None)
                )
            ).all()
            
            completion_times = [(g.completed_date - g.created_at).days for g in completed]
            avg_completion_time = statistics.mean(completion_times) if completion_times else 0
            
            # Current and best streak
            current_streak = 5  # Placeholder
            best_streak = 12  # Placeholder
            
            # Total XP
            total_xp = sum(g.xp_earned for g in self.db.query(Goal).all())
            
            # Goals by type and priority
            all_goals = self.db.query(Goal).all()
            goals_by_type = defaultdict(int)
            goals_by_priority = defaultdict(int)
            
            for goal in all_goals:
                goals_by_type[goal.goal_type] += 1
                goals_by_priority[goal.priority] += 1
            
            # Completion rate by type
            completion_rate_by_type = {}
            for goal_type in goals_by_type:
                type_goals = [g for g in all_goals if g.goal_type == goal_type]
                type_completed = len([g for g in type_goals if g.status == "completed"])
                completion_rate_by_type[goal_type] = (type_completed / len(type_goals) * 100) if type_goals else 0
            
            # Upcoming deadlines
            upcoming_deadlines = self.db.query(Goal).filter(
                and_(
                    Goal.target_date >= datetime.utcnow(),
                    Goal.target_date <= datetime.utcnow() + timedelta(days=7),
                    Goal.status == "active"
                )
            ).limit(5).all()
            
            upcoming_list = [{
                "goal_id": str(g.id),
                "title": g.title,
                "deadline": g.target_date.isoformat(),
                "progress": float(g.progress_percentage) if g.progress_percentage else 0
            } for g in upcoming_deadlines]
            
            # At-risk goals (overdue or low progress)
            at_risk = self.db.query(Goal).filter(
                or_(
                    and_(Goal.target_date < datetime.utcnow(), Goal.status != "completed"),
                    and_(Goal.progress_percentage < 25, Goal.status == "active")
                )
            ).limit(5).all()
            
            at_risk_list = [{
                "goal_id": str(g.id),
                "title": g.title,
                "reason": "overdue" if g.target_date < datetime.utcnow() else "low_progress",
                "progress": float(g.progress_percentage) if g.progress_percentage else 0
            } for g in at_risk]
            
            return {
                "total_goals": total_goals,
                "active_goals": active_goals,
                "completed_goals": completed_goals,
                "overdue_goals": overdue_goals,
                "completion_rate": completion_rate,
                "average_completion_time_days": avg_completion_time,
                "current_streak": current_streak,
                "best_streak": best_streak,
                "total_xp_earned": total_xp,
                "goals_by_type": dict(goals_by_type),
                "goals_by_priority": dict(goals_by_priority),
                "completion_rate_by_type": completion_rate_by_type,
                "upcoming_deadlines": upcoming_list,
                "at_risk_goals": at_risk_list
            }
            
        except Exception as e:
            logger.error(f"Error getting goal analytics: {str(e)}")
            return {
                "total_goals": 0,
                "active_goals": 0,
                "completed_goals": 0,
                "overdue_goals": 0,
                "completion_rate": 0.0,
                "average_completion_time_days": 0.0,
                "current_streak": 0,
                "best_streak": 0,
                "total_xp_earned": 0,
                "goals_by_type": {},
                "goals_by_priority": {},
                "completion_rate_by_type": {},
                "upcoming_deadlines": [],
                "at_risk_goals": []
            }
    
    def _generate_performance_comparisons(self, start_date: date, end_date: date):
        """Generate performance comparisons with previous periods"""
        current_summary = self._generate_study_analytics_summary(start_date, end_date)
        
        # Compare with previous period
        days_diff = (end_date - start_date).days + 1
        prev_start = start_date - timedelta(days=days_diff)
        prev_end = start_date - timedelta(days=1)
        prev_summary = self._generate_study_analytics_summary(prev_start, prev_end)
        
        comparisons = []
        
        metrics = [
            ("Study Time", current_summary.total_study_time_minutes, prev_summary.total_study_time_minutes, "minutes"),
            ("Focus Score", current_summary.avg_focus_score, prev_summary.avg_focus_score, "score"),
            ("Productivity", current_summary.avg_productivity_score, prev_summary.avg_productivity_score, "score"),
            ("Reading Speed", current_summary.avg_reading_speed, prev_summary.avg_reading_speed, "wpm"),
            ("Study Efficiency", current_summary.study_efficiency, prev_summary.study_efficiency, "percentage")
        ]
        
        for metric_name, current_value, previous_value, unit in metrics:
            change_percentage = self._calculate_trend(current_value, previous_value)
            
            if change_percentage > 5:
                trend_direction = "improving"
            elif change_percentage < -5:
                trend_direction = "declining"
            else:
                trend_direction = "stable"
            
            comparisons.append({
                "metric_name": metric_name,
                "current_value": current_value,
                "previous_value": previous_value,
                "change_percentage": change_percentage,
                "trend_direction": trend_direction,
                "benchmark_value": None,  # Could add benchmarks later
                "percentile_rank": None   # Could calculate percentile later
            })
        
        return comparisons
    
    def _generate_recommendations(self, summary: StudyAnalyticsSummary, topic_analytics: List[TopicAnalytics]):
        """Generate study recommendations based on analytics"""
        recommendations = []
        
        # Study time recommendations
        if summary.avg_daily_study_minutes < 60:
            recommendations.append("Consider increasing daily study time to at least 60 minutes for better progress")
        elif summary.avg_daily_study_minutes > 180:
            recommendations.append("Great dedication! Consider taking breaks to avoid burnout")
        
        # Focus score recommendations
        if summary.avg_focus_score < 70:
            recommendations.append("Try the Pomodoro technique to improve focus during study sessions")
        
        # Consistency recommendations
        if summary.consistency_score < 50:
            recommendations.append("Build a more consistent study routine - even 30 minutes daily helps")
        
        # Topic-specific recommendations
        low_progress_topics = [t for t in topic_analytics if t.completion_percentage < 25]
        if low_progress_topics:
            topic_names = [t.topic_name for t in low_progress_topics[:2]]
            recommendations.append(f"Focus on making progress in: {', '.join(topic_names)}")
        
        # Exercise recommendations
        total_exercises = sum(t.exercises_completed for t in topic_analytics)
        if total_exercises < 10:
            recommendations.append("Add more practice exercises to reinforce your learning")
        
        return recommendations[:5]  # Return top 5 recommendations
    
    def _get_weekly_trends(self, start_date: date, end_date: date):
        """Get weekly trends for the specified period"""
        # This would typically query the weekly_trends table
        # For now, return empty list as placeholder
        return []
    
    def _get_trend_data(self, start_date: date, end_date: date):
        """Get efficiency and focus trends"""
        # Get daily stats for the period
        daily_stats = self.daily_stats_service.get_daily_stats_range(start_date, end_date)
        
        efficiency_trends = [float(stat.productivity_score) for stat in daily_stats]
        focus_trends = [float(stat.average_focus_score) for stat in daily_stats]
        
        return efficiency_trends, focus_trends
    
    def _generate_productivity_heatmap(self):
        """Generate productivity heatmap by hour and day"""
        # Query sessions grouped by hour and day of week
        sessions = self.db.query(StudySession).filter(
            StudySession.start_time >= datetime.utcnow() - timedelta(days=30)
        ).all()
        
        heatmap_data = defaultdict(lambda: defaultdict(list))
        
        for session in sessions:
            hour = session.start_time.hour
            day_of_week = session.start_time.weekday()
            productivity = float(session.productivity_score) if session.productivity_score else 0
            heatmap_data[day_of_week][hour].append(productivity)
        
        # Average productivity scores
        heatmap = {}
        for day in range(7):  # 0-6 for Monday-Sunday
            heatmap[day] = {}
            for hour in range(24):
                scores = heatmap_data[day][hour]
                heatmap[day][hour] = statistics.mean(scores) if scores else 0
        
        return heatmap
    
    def _get_achievement_progress(self):
        """Get achievement progress"""
        return {
            "total_achievements": 25,
            "earned_achievements": 8,
            "progress_percentage": 32.0,
            "next_achievement": {
                "name": "Study Streak Champion",
                "description": "Study for 30 consecutive days",
                "current_progress": 15,
                "target_progress": 30
            }
        }
    
    def _get_upcoming_milestones(self):
        """Get upcoming milestones"""
        try:
            milestones = self.db.query(Goal).filter(
                and_(
                    Goal.status == "active",
                    Goal.target_date >= datetime.utcnow(),
                    Goal.target_date <= datetime.utcnow() + timedelta(days=14)
                )
            ).limit(5).all()
            
            return [{
                "goal_id": str(g.id),
                "title": g.title,
                "target_date": g.target_date.isoformat(),
                "progress_percentage": float(g.progress_percentage) if g.progress_percentage else 0,
                "days_remaining": (g.target_date - datetime.utcnow()).days if g.target_date else None
            } for g in milestones]
            
        except Exception:
            return []
    
    def _calculate_current_streak(self, user_id: str) -> int:
        """Calculate current study streak"""
        # Get daily stats for recent days
        recent_stats = self.db.query(DailyStats).filter(
            and_(
                DailyStats.user_id == user_id,
                DailyStats.stat_date >= datetime.utcnow().date() - timedelta(days=30)
            )
        ).order_by(DailyStats.stat_date.desc()).all()
        
        current_streak = 0
        for stat in recent_stats:
            if stat.total_study_minutes > 0:
                current_streak += 1
            else:
                break
        
        return current_streak
    
    def _calculate_current_productivity(self) -> float:
        """Calculate current productivity score"""
        # Get recent sessions
        recent_sessions = self.db.query(StudySession).filter(
            StudySession.start_time >= datetime.utcnow() - timedelta(hours=24)
        ).all()
        
        if not recent_sessions:
            return 0.0
        
        productivity_scores = [float(s.productivity_score) for s in recent_sessions if s.productivity_score]
        return statistics.mean(productivity_scores) if productivity_scores else 0.0
    
    def _get_next_milestone(self) -> Optional[str]:
        """Get next upcoming milestone"""
        try:
            next_goal = self.db.query(Goal).filter(
                and_(
                    Goal.status == "active",
                    Goal.target_date >= datetime.utcnow()
                )
            ).order_by(Goal.target_date.asc()).first()
            
            return next_goal.title if next_goal else None
        except Exception:
            return None
    
    def _calculate_daily_goal_progress(self) -> float:
        """Calculate today's goal progress"""
        today = datetime.utcnow().date()
        
        # Get progress logs for today
        today_progress = self.db.query(GoalProgress).filter(
            GoalProgress.recorded_at >= datetime.combine(today, datetime.min.time())
        ).all()
        
        if not today_progress:
            return 0.0
        
        # Sum positive progress changes
        total_progress = sum(p.change_amount for p in today_progress if p.change_amount > 0)
        return min(100.0, total_progress)  # Cap at 100%
    
    def _estimate_session_completion(self) -> Optional[int]:
        """Estimate completion time for current session"""
        current_session = self.db.query(StudySession).filter(
            StudySession.end_time.is_(None)
        ).first()
        
        if not current_session:
            return None
        
        # Calculate remaining time based on planned duration
        elapsed_minutes = (datetime.utcnow() - current_session.start_time).total_seconds() / 60
        remaining_minutes = max(0, current_session.planned_duration_minutes - elapsed_minutes)
        
        return int(remaining_minutes)
    
    def _generate_live_recommendations(self, daily_stats, current_session) -> List[str]:
        """Generate real-time study recommendations"""
        recommendations = []
        
        # Check daily progress
        if daily_stats.total_study_minutes < 30:
            recommendations.append("You're just getting started today - aim for at least 60 minutes!")
        elif daily_stats.total_study_minutes > 120:
            recommendations.append("Great progress today! Consider taking a break soon.")
        
        # Current session recommendations
        if current_session:
            elapsed = (datetime.utcnow() - current_session.start_time).total_seconds() / 60
            if elapsed > 90:
                recommendations.append("Long session! Take a 10-minute break to maintain focus.")
            elif elapsed > 45:
                recommendations.append("Halfway through - you're doing great!")
        
        # Focus recommendations
        if daily_stats.average_focus_score < 70:
            recommendations.append("Try eliminating distractions to improve focus.")
        
        return recommendations[:3]
    
    def _get_previous_period_summary(self, start_date: date, end_date: date) -> Dict:
        """Get summary for previous period for trend calculation"""
        try:
            prev_summary = self._generate_study_analytics_summary(start_date, end_date)
            return {
                'total_study_time': prev_summary.total_study_time_minutes,
                'avg_focus': prev_summary.avg_focus_score,
                'avg_productivity': prev_summary.avg_productivity_score,
                'study_efficiency': prev_summary.study_efficiency
            }
        except Exception:
            return {
                'total_study_time': 0,
                'avg_focus': 0,
                'avg_productivity': 0,
                'study_efficiency': 0
            }
    
    def _calculate_trend(self, current_value: float, previous_value: float) -> float:
        """Calculate percentage change trend"""
        if previous_value == 0:
            return 100.0 if current_value > 0 else 0.0
        
        return ((current_value - previous_value) / previous_value) * 100


class DailyStatsService:
    """Service for daily statistics management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_or_create_daily_stats(self, stat_date: date, user_id: str = "default_user") -> DailyStatsResponse:
        """Get or create daily stats for a specific date"""
        daily_stat = self.db.query(DailyStats).filter(
            and_(
                DailyStats.stat_date == stat_date,
                DailyStats.user_id == user_id
            )
        ).first()
        
        if not daily_stat:
            # Create new daily stats
            daily_stat = DailyStats(
                stat_date=stat_date,
                user_id=user_id
            )
            self.db.add(daily_stat)
            self.db.commit()
            self.db.refresh(daily_stat)
        
        # Update stats with current data
        self._update_daily_stats(daily_stat)
        
        return self._to_response(daily_stat)
    
    def get_daily_stats_range(self, start_date: date, end_date: date, user_id: str = "default_user") -> List[DailyStatsResponse]:
        """Get daily stats for a date range"""
        stats = self.db.query(DailyStats).filter(
            and_(
                DailyStats.user_id == user_id,
                DailyStats.stat_date >= start_date,
                DailyStats.stat_date <= end_date
            )
        ).order_by(DailyStats.stat_date.asc()).all()
        
        return [self._to_response(stat) for stat in stats]
    
    def _update_daily_stats(self, daily_stat: DailyStats):
        """Update daily stats with current data"""
        stat_date = daily_stat.stat_date
        
        # Get sessions for the day
        day_start = datetime.combine(stat_date, datetime.min.time())
        day_end = datetime.combine(stat_date, datetime.max.time())
        
        sessions = self.db.query(StudySession).filter(
            and_(
                StudySession.start_time >= day_start,
                StudySession.start_time <= day_end,
                StudySession.end_time.isnot(None)
            )
        ).all()
        
        if sessions:
            daily_stat.total_study_minutes = sum(s.total_minutes for s in sessions)
            daily_stat.active_study_minutes = sum(s.active_minutes for s in sessions)
            daily_stat.break_minutes = sum(s.break_minutes for s in sessions)
            daily_stat.idle_minutes = sum(s.idle_minutes for s in sessions)
            daily_stat.total_sessions = len(sessions)
            daily_stat.completed_sessions = len([s for s in sessions if s.end_time])
            daily_stat.average_session_duration = statistics.mean([s.total_minutes for s in sessions])
            
            focus_scores = [float(s.focus_score) for s in sessions if s.focus_score]
            daily_stat.average_focus_score = statistics.mean(focus_scores) if focus_scores else 0
            
            daily_stat.pages_read = sum(s.pages_completed for s in sessions)
            daily_stat.pomodoro_cycles = sum(s.pomodoro_cycles for s in sessions)
            daily_stat.xp_earned = sum(s.xp_earned for s in sessions)
        
        # Get other activities for the day
        exercises_completed = self.db.query(ExerciseAttempt).filter(
            and_(
                ExerciseAttempt.attempted_at >= day_start,
                ExerciseAttempt.attempted_at <= day_end,
                ExerciseAttempt.is_correct == True
            )
        ).count()
        daily_stat.exercises_completed = exercises_completed
        
        notes_created = self.db.query(Note).filter(
            and_(
                Note.created_at >= day_start,
                Note.created_at <= day_end
            )
        ).count()
        daily_stat.notes_created = notes_created
        
        highlights_made = self.db.query(Highlight).filter(
            and_(
                Highlight.created_at >= day_start,
                Highlight.created_at <= day_end
            )
        ).count()
        daily_stat.highlights_made = highlights_made
        
        # Calculate productivity score
        if daily_stat.total_study_minutes > 0:
            efficiency = (daily_stat.active_study_minutes / daily_stat.total_study_minutes) * 100
            focus_score = daily_stat.average_focus_score
            activity_score = min(100, (daily_stat.pages_read + daily_stat.exercises_completed + daily_stat.notes_created) * 10)
            
            daily_stat.productivity_score = (efficiency * 0.4) + (focus_score * 0.4) + (activity_score * 0.2)
        
        self.db.commit()
    
    def _to_response(self, daily_stat: DailyStats) -> DailyStatsResponse:
        """Convert daily stats model to response schema"""
        return DailyStatsResponse(
            id=daily_stat.id,
            stat_date=daily_stat.stat_date,
            user_id=daily_stat.user_id,
            total_study_minutes=daily_stat.total_study_minutes,
            active_study_minutes=daily_stat.active_study_minutes,
            break_minutes=daily_stat.break_minutes,
            idle_minutes=daily_stat.idle_minutes,
            total_sessions=daily_stat.total_sessions,
            completed_sessions=daily_stat.completed_sessions,
            average_session_duration=daily_stat.average_session_duration or 0.0,
            average_focus_score=float(daily_stat.average_focus_score) if daily_stat.average_focus_score else 0.0,
            pages_read=daily_stat.pages_read,
            pdfs_completed=daily_stat.pdfs_completed,
            exercises_completed=daily_stat.exercises_completed,
            notes_created=daily_stat.notes_created,
            highlights_made=daily_stat.highlights_made,
            goals_worked_on=daily_stat.goals_worked_on,
            goals_completed=daily_stat.goals_completed,
            milestones_achieved=daily_stat.milestones_achieved,
            pomodoro_cycles=daily_stat.pomodoro_cycles,
            pomodoro_effectiveness=float(daily_stat.pomodoro_effectiveness) if daily_stat.pomodoro_effectiveness else 0.0,
            reading_speed_wpm=float(daily_stat.reading_speed_wpm) if daily_stat.reading_speed_wpm else 0.0,
            comprehension_score=float(daily_stat.comprehension_score) if daily_stat.comprehension_score else 0.0,
            productivity_score=float(daily_stat.productivity_score) if daily_stat.productivity_score else 0.0,
            xp_earned=daily_stat.xp_earned,
            achievements_unlocked=daily_stat.achievements_unlocked,
            streak_days=daily_stat.streak_days,
            study_environments=daily_stat.study_environments or [],
            peak_performance_hour=daily_stat.peak_performance_hour,
            topic_breakdown=daily_stat.topic_breakdown or {},
            session_breakdown=daily_stat.session_breakdown or {},
            goal_breakdown=daily_stat.goal_breakdown or {},
            created_at=daily_stat.created_at,
            updated_at=daily_stat.updated_at,
            efficiency_percentage=daily_stat.efficiency_percentage,
            focus_grade=daily_stat.focus_grade
        )


class InsightsService:
    """Service for generating performance insights and recommendations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def generate_performance_insights(self, start_date: date, end_date: date, limit: int = 10) -> List[PerformanceInsightResponse]:
        """Generate performance insights for the specified period"""
        insights = []
        
        # Get sessions for analysis
        sessions = self.db.query(StudySession).filter(
            and_(
                StudySession.start_time >= datetime.combine(start_date, datetime.min.time()),
                StudySession.start_time <= datetime.combine(end_date, datetime.max.time()),
                StudySession.end_time.isnot(None)
            )
        ).all()
        
        if not sessions:
            return []
        
        # Insight 1: Focus trend analysis
        focus_insight = self._analyze_focus_trends(sessions)
        if focus_insight:
            insights.append(focus_insight)
        
        # Insight 2: Productivity patterns
        productivity_insight = self._analyze_productivity_patterns(sessions)
        if productivity_insight:
            insights.append(productivity_insight)
        
        # Insight 3: Time management
        time_insight = self._analyze_time_management(sessions)
        if time_insight:
            insights.append(time_insight)
        
        # Insight 4: Study consistency
        consistency_insight = self._analyze_study_consistency(sessions, start_date, end_date)
        if consistency_insight:
            insights.append(consistency_insight)
        
        # Insight 5: Performance by time of day
        time_performance_insight = self._analyze_time_performance(sessions)
        if time_performance_insight:
            insights.append(time_performance_insight)
        
        return insights[:limit]
    
    def get_active_insights(self, limit: int = 5) -> List[PerformanceInsightResponse]:
        """Get currently active insights"""
        insights = self.db.query(PerformanceInsights).filter(
            and_(
                PerformanceInsights.is_active == True,
                PerformanceInsights.user_dismissed == False,
                or_(
                    PerformanceInsights.valid_until.is_(None),
                    PerformanceInsights.valid_until >= datetime.utcnow().date()
                )
            )
        ).order_by(
            desc(PerformanceInsights.impact_score),
            desc(PerformanceInsights.confidence_score)
        ).limit(limit).all()
        
        return [self._insight_to_response(insight) for insight in insights]
    
    def _analyze_focus_trends(self, sessions: List[StudySession]) -> Optional[PerformanceInsightResponse]:
        """Analyze focus score trends"""
        focus_scores = [float(s.focus_score) for s in sessions if s.focus_score]
        
        if len(focus_scores) < 3:
            return None
        
        recent_scores = focus_scores[-5:]  # Last 5 sessions
        earlier_scores = focus_scores[:-5] if len(focus_scores) > 5 else focus_scores[:len(focus_scores)//2]
        
        if not earlier_scores:
            return None
        
        recent_avg = statistics.mean(recent_scores)
        earlier_avg = statistics.mean(earlier_scores)
        
        improvement = recent_avg - earlier_avg
        
        if improvement > 10:
            insight_type = "trend"
            title = "Focus Improving"
            description = f"Your focus has improved by {improvement:.1f} points in recent sessions"
            action_items = ["Keep up the great work!", "Consider what's working and maintain those habits"]
            confidence_score = 0.8
            impact_score = 0.7
        elif improvement < -10:
            insight_type = "warning"
            title = "Focus Declining"
            description = f"Your focus has decreased by {abs(improvement):.1f} points recently"
            action_items = [
                "Review your study environment for distractions",
                "Try shorter study sessions with breaks",
                "Consider the Pomodoro technique"
            ]
            confidence_score = 0.8
            impact_score = 0.9
        else:
            return None
        
        return PerformanceInsightResponse(
            id=UUID('00000000-0000-0000-0000-000000000001'),  # Placeholder ID
            insight_type=insight_type,
            category="focus",
            title=title,
            description=description,
            confidence_score=confidence_score,
            impact_score=impact_score,
            is_actionable=True,
            action_items=action_items,
            estimated_improvement=f"{abs(improvement):.1f} point focus improvement",
            user_id="default_user",
            data_points={"recent_avg": recent_avg, "earlier_avg": earlier_avg, "improvement": improvement},
            is_active=True,
            user_dismissed=False,
            user_acted_on=False,
            generated_at=datetime.utcnow(),
            priority_score=confidence_score * impact_score
        )
    
    def _analyze_productivity_patterns(self, sessions: List[StudySession]) -> Optional[PerformanceInsightResponse]:
        """Analyze productivity patterns by day of week"""
        productivity_by_day = defaultdict(list)
        
        for session in sessions:
            if session.productivity_score:
                day_of_week = session.start_time.strftime('%A')
                productivity_by_day[day_of_week].append(float(session.productivity_score))
        
        if len(productivity_by_day) < 3:
            return None
        
        # Find best and worst days
        day_averages = {day: statistics.mean(scores) for day, scores in productivity_by_day.items()}
        best_day = max(day_averages, key=day_averages.get)
        worst_day = min(day_averages, key=day_averages.get)
        
        best_score = day_averages[best_day]
        worst_score = day_averages[worst_day]
        
        if best_score - worst_score > 20:  # Significant difference
            return PerformanceInsightResponse(
                id=UUID('00000000-0000-0000-0000-000000000002'),
                insight_type="pattern",
                category="productivity",
                title="Productivity Varies by Day",
                description=f"You're most productive on {best_day}s ({best_score:.1f}) and least productive on {worst_day}s ({worst_score:.1f})",
                confidence_score=0.7,
                impact_score=0.6,
                is_actionable=True,
                action_items=[
                    f"Schedule important study sessions on {best_day}s",
                    f"Use {worst_day}s for lighter review or planning",
                    "Consider what makes you more productive on certain days"
                ],
                estimated_improvement="15-20% productivity gain through better scheduling",
                user_id="default_user",
                data_points=day_averages,
                is_active=True,
                user_dismissed=False,
                user_acted_on=False,
                generated_at=datetime.utcnow(),
                priority_score=0.42
            )
        
        return None
    
    def _analyze_time_management(self, sessions: List[StudySession]) -> Optional[PerformanceInsightResponse]:
        """Analyze time management effectiveness"""
        planned_vs_actual = []
        
        for session in sessions:
            if session.planned_duration_minutes and session.total_minutes:
                ratio = session.total_minutes / session.planned_duration_minutes
                planned_vs_actual.append(ratio)
        
        if len(planned_vs_actual) < 5:
            return None
        
        avg_ratio = statistics.mean(planned_vs_actual)
        
        if avg_ratio < 0.7:  # Consistently under-studying
            return PerformanceInsightResponse(
                id=UUID('00000000-0000-0000-0000-000000000003'),
                insight_type="recommendation",
                category="time_management",
                title="Sessions Often Cut Short",
                description=f"You complete only {avg_ratio*100:.0f}% of planned study time on average",
                confidence_score=0.8,
                impact_score=0.8,
                is_actionable=True,
                action_items=[
                    "Plan shorter, more achievable study sessions",
                    "Identify common interruptions and minimize them",
                    "Use a timer to stay on track"
                ],
                estimated_improvement="30% increase in study completion rate",
                user_id="default_user",
                data_points={"average_completion_ratio": avg_ratio},
                is_active=True,
                user_dismissed=False,
                user_acted_on=False,
                generated_at=datetime.utcnow(),
                priority_score=0.64
            )
        elif avg_ratio > 1.5:  # Consistently over-studying
            return PerformanceInsightResponse(
                id=UUID('00000000-0000-0000-0000-000000000004'),
                insight_type="recommendation",
                category="time_management",
                title="Sessions Often Run Over",
                description=f"You study {avg_ratio*100:.0f}% of planned time on average - great dedication!",
                confidence_score=0.8,
                impact_score=0.6,
                is_actionable=True,
                action_items=[
                    "Plan more realistic study durations",
                    "Take regular breaks to avoid burnout",
                    "Consider if you're being too ambitious with time estimates"
                ],
                estimated_improvement="Better work-life balance",
                user_id="default_user",
                data_points={"average_completion_ratio": avg_ratio},
                is_active=True,
                user_dismissed=False,
                user_acted_on=False,
                generated_at=datetime.utcnow(),
                priority_score=0.48
            )
        
        return None
    
    def _analyze_study_consistency(self, sessions: List[StudySession], start_date: date, end_date: date) -> Optional[PerformanceInsightResponse]:
        """Analyze study consistency patterns"""
        days_with_study = set(s.start_time.date() for s in sessions)
        total_days = (end_date - start_date).days + 1
        consistency_rate = len(days_with_study) / total_days
        
        if consistency_rate >= 0.8:
            return PerformanceInsightResponse(
                id=UUID('00000000-0000-0000-0000-000000000005'),
                insight_type="achievement",
                category="consistency",
                title="Excellent Study Consistency",
                description=f"You've studied on {consistency_rate*100:.0f}% of days - fantastic habit!",
                confidence_score=0.9,
                impact_score=0.7,
                is_actionable=True,
                action_items=[
                    "Keep up this excellent routine",
                    "Consider gradually increasing study intensity",
                    "Share your consistency tips with others"
                ],
                estimated_improvement="Continued long-term learning success",
                user_id="default_user",
                data_points={"consistency_rate": consistency_rate, "study_days": len(days_with_study)},
                is_active=True,
                user_dismissed=False,
                user_acted_on=False,
                generated_at=datetime.utcnow(),
                priority_score=0.63
            )
        elif consistency_rate < 0.4:
            return PerformanceInsightResponse(
                id=UUID('00000000-0000-0000-0000-000000000006'),
                insight_type="warning",
                category="consistency",
                title="Low Study Consistency",
                description=f"You've studied on only {consistency_rate*100:.0f}% of days",
                confidence_score=0.9,
                impact_score=0.9,
                is_actionable=True,
                action_items=[
                    "Start with just 15 minutes daily to build the habit",
                    "Set specific study times and stick to them",
                    "Use reminders or calendar blocks"
                ],
                estimated_improvement="2-3x improvement in learning retention",
                user_id="default_user",
                data_points={"consistency_rate": consistency_rate, "study_days": len(days_with_study)},
                is_active=True,
                user_dismissed=False,
                user_acted_on=False,
                generated_at=datetime.utcnow(),
                priority_score=0.81
            )
        
        return None
    
    def _analyze_time_performance(self, sessions: List[StudySession]) -> Optional[PerformanceInsightResponse]:
        """Analyze performance by time of day"""
        performance_by_hour = defaultdict(list)
        
        for session in sessions:
            if session.productivity_score:
                hour = session.start_time.hour
                performance_by_hour[hour].append(float(session.productivity_score))
        
        if len(performance_by_hour) < 3:
            return None
        
        # Find peak performance hours
        hour_averages = {hour: statistics.mean(scores) for hour, scores in performance_by_hour.items()}
        best_hour = max(hour_averages, key=hour_averages.get)
        best_score = hour_averages[best_hour]
        
        # Format hour for display
        if best_hour == 0:
            time_str = "12 AM"
        elif best_hour < 12:
            time_str = f"{best_hour} AM"
        elif best_hour == 12:
            time_str = "12 PM"
        else:
            time_str = f"{best_hour - 12} PM"
        
        return PerformanceInsightResponse(
            id=UUID('00000000-0000-0000-0000-000000000007'),
            insight_type="pattern",
            category="productivity",
            title="Peak Performance Time Identified",
            description=f"You're most productive around {time_str} with {best_score:.1f} average productivity",
            confidence_score=0.7,
            impact_score=0.7,
            is_actionable=True,
            action_items=[
                f"Schedule challenging topics around {time_str}",
                "Plan important deadlines for your peak hours",
                "Use less productive times for review or planning"
            ],
            estimated_improvement="20-25% productivity gain through optimal scheduling",
            user_id="default_user",
            data_points={"peak_hour": best_hour, "peak_score": best_score, "hour_averages": hour_averages},
            is_active=True,
            user_dismissed=False,
            user_acted_on=False,
            generated_at=datetime.utcnow(),
            priority_score=0.49
        )
    
    def _insight_to_response(self, insight: PerformanceInsights) -> PerformanceInsightResponse:
        """Convert insight model to response schema"""
        return PerformanceInsightResponse(
            id=insight.id,
            insight_type=insight.insight_type,
            category=insight.category,
            title=insight.title,
            description=insight.description,
            confidence_score=float(insight.confidence_score),
            impact_score=float(insight.impact_score),
            is_actionable=insight.is_actionable,
            action_items=insight.action_items or [],
            estimated_improvement=insight.estimated_improvement,
            user_id=insight.user_id,
            topic_id=insight.topic_id,
            goal_id=insight.goal_id,
            data_points=insight.data_points or {},
            time_period_start=insight.time_period_start,
            time_period_end=insight.time_period_end,
            valid_until=insight.valid_until,
            is_active=insight.is_active,
            user_dismissed=insight.user_dismissed,
            user_acted_on=insight.user_acted_on,
            generated_at=insight.generated_at,
            last_shown=insight.last_shown,
            priority_score=insight.priority_score
        )


class StudyEfficiencyService:
    """Service for study efficiency analysis and optimization"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_latest_efficiency_metrics(self, user_id: str = "default_user") -> Optional[StudyEfficiencyMetricsResponse]:
        """Get the most recent efficiency metrics"""
        latest_metrics = self.db.query(StudyEfficiencyMetrics).filter(
            StudyEfficiencyMetrics.user_id == user_id
        ).order_by(desc(StudyEfficiencyMetrics.measurement_date)).first()
        
        if not latest_metrics:
            # Generate metrics for today
            return self.calculate_efficiency_metrics(datetime.utcnow().date(), user_id)
        
        return self._to_response(latest_metrics)
    
    def calculate_efficiency_metrics(self, measurement_date: date, user_id: str = "default_user") -> StudyEfficiencyMetricsResponse:
        """Calculate efficiency metrics for a specific date"""
        
        # Get sessions for the date
        day_start = datetime.combine(measurement_date, datetime.min.time())
        day_end = datetime.combine(measurement_date, datetime.max.time())
        
        sessions = self.db.query(StudySession).filter(
            and_(
                StudySession.start_time >= day_start,
                StudySession.start_time <= day_end,
                StudySession.end_time.isnot(None)
            )
        ).all()
        
        if not sessions:
            # Return zero metrics
            return StudyEfficiencyMetricsResponse(
                id=UUID('00000000-0000-0000-0000-000000000000'),
                measurement_date=measurement_date,
                user_id=user_id,
                pages_per_hour=0.0,
                concepts_mastered_per_hour=0.0,
                retention_rate=0.0,
                application_success_rate=0.0,
                attention_span_minutes=0.0,
                distraction_frequency=0.0,
                deep_work_percentage=0.0,
                cognitive_load_score=0.0,
                optimal_difficulty_level=0.0,
                challenge_comfort_ratio=0.0,
                flow_state_frequency=0.0,
                energy_efficiency=0.0,
                environment_effectiveness={},
                time_of_day_performance={},
                session_length_optimization={},
                personal_benchmark_ratio=1.0,
                peer_benchmark_ratio=1.0,
                improvement_rate=0.0,
                calculated_at=datetime.utcnow()
            )
        
        # Calculate efficiency metrics
        total_hours = sum(s.total_minutes for s in sessions) / 60
        total_pages = sum(s.pages_completed for s in sessions)
        
        pages_per_hour = total_pages / total_hours if total_hours > 0 else 0
        
        # Estimate concepts mastered (rough calculation)
        concepts_per_page = 2  # Assumption
        concepts_mastered_per_hour = (total_pages * concepts_per_page) / total_hours if total_hours > 0 else 0
        
        # Attention span (average session duration)
        attention_span = statistics.mean([s.total_minutes for s in sessions]) if sessions else 0
        
        # Deep work percentage (active time / total time)
        total_active_minutes = sum(s.active_minutes for s in sessions)
        total_minutes = sum(s.total_minutes for s in sessions)
        deep_work_percentage = (total_active_minutes / total_minutes * 100) if total_minutes > 0 else 0
        
        # Focus and productivity scores
        focus_scores = [float(s.focus_score) for s in sessions if s.focus_score]
        avg_focus = statistics.mean(focus_scores) if focus_scores else 0
        
        # Environment effectiveness
        env_effectiveness = {}
        env_sessions = defaultdict(list)
        for session in sessions:
            if session.environment_type and session.productivity_score:
                env_sessions[session.environment_type].append(float(session.productivity_score))
        
        for env, scores in env_sessions.items():
            env_effectiveness[env] = statistics.mean(scores)
        
        # Time of day performance
        time_performance = {}
        hour_sessions = defaultdict(list)
        for session in sessions:
            if session.productivity_score:
                hour = session.start_time.hour
                hour_sessions[hour].append(float(session.productivity_score))
        
        for hour, scores in hour_sessions.items():
            time_performance[str(hour)] = statistics.mean(scores)
        
        # Create efficiency metrics record
        efficiency_metrics = StudyEfficiencyMetrics(
            measurement_date=measurement_date,
            user_id=user_id,
            pages_per_hour=pages_per_hour,
            concepts_mastered_per_hour=concepts_mastered_per_hour,
            retention_rate=85.0,  # Placeholder - would need spaced repetition data
            application_success_rate=78.0,  # Placeholder - would need exercise data
            attention_span_minutes=attention_span,
            distraction_frequency=sum(s.interruptions for s in sessions) / len(sessions) if sessions else 0,
            deep_work_percentage=deep_work_percentage,
            cognitive_load_score=avg_focus / 20,  # Convert focus score to 0-5 scale
            optimal_difficulty_level=3.0,  # Placeholder
            challenge_comfort_ratio=1.2,  # Placeholder
            flow_state_frequency=0.6 if avg_focus > 80 else 0.3,  # Estimated based on focus
            energy_efficiency=deep_work_percentage / 100,
            environment_effectiveness=env_effectiveness,
            time_of_day_performance=time_performance,
            session_length_optimization={"optimal_length": int(attention_span)},
            personal_benchmark_ratio=1.1,  # Placeholder
            peer_benchmark_ratio=0.95,  # Placeholder
            improvement_rate=5.0  # Placeholder
        )
        
        self.db.add(efficiency_metrics)
        self.db.commit()
        self.db.refresh(efficiency_metrics)
        
        return self._to_response(efficiency_metrics)
    
    def _to_response(self, metrics: StudyEfficiencyMetrics) -> StudyEfficiencyMetricsResponse:
        """Convert efficiency metrics to response schema"""
        return StudyEfficiencyMetricsResponse(
            id=metrics.id,
            measurement_date=metrics.measurement_date,
            user_id=metrics.user_id,
            topic_id=metrics.topic_id,
            pages_per_hour=float(metrics.pages_per_hour),
            concepts_mastered_per_hour=float(metrics.concepts_mastered_per_hour),
            retention_rate=float(metrics.retention_rate),
            application_success_rate=float(metrics.application_success_rate),
            attention_span_minutes=float(metrics.attention_span_minutes),
            distraction_frequency=float(metrics.distraction_frequency),
            deep_work_percentage=float(metrics.deep_work_percentage),
            cognitive_load_score=float(metrics.cognitive_load_score),
            optimal_difficulty_level=float(metrics.optimal_difficulty_level),
            challenge_comfort_ratio=float(metrics.challenge_comfort_ratio),
            flow_state_frequency=float(metrics.flow_state_frequency),
            energy_efficiency=float(metrics.energy_efficiency),
            environment_effectiveness=metrics.environment_effectiveness or {},
            time_of_day_performance=metrics.time_of_day_performance or {},
            session_length_optimization=metrics.session_length_optimization or {},
            personal_benchmark_ratio=float(metrics.personal_benchmark_ratio),
            peer_benchmark_ratio=float(metrics.peer_benchmark_ratio),
            improvement_rate=float(metrics.improvement_rate),
            calculated_at=metrics.calculated_at
        )