# backend/modules/goals/services.py
"""
StudySprint 4.0 - Goals Module Services
Stage 6: Complete business logic for SMART goals and achievement system
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
import logging
import statistics

from common.database import Topic, PDF
from .models import Goal, Milestone, GoalProgress, Achievement, UserAchievement
from .schemas import (
    GoalCreate, GoalUpdate, GoalResponse, GoalList, GoalSearchParams,
    MilestoneCreate, MilestoneResponse, GoalAnalytics, GoalDashboard,
    GoalProgressUpdate, BulkGoalCreate, BulkGoalResponse,
    UserAchievementResponse, AchievementResponse, GoalRecommendation
)

logger = logging.getLogger(__name__)


class GoalService:
    """Comprehensive service for SMART goal management and tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_goal(self, goal_data: GoalCreate) -> GoalResponse:
        """Create a new SMART goal with validation and setup"""
        
        # Validate SMART criteria
        self._validate_smart_goal(goal_data)
        
        # Create goal
        goal = Goal(
            title=goal_data.title,
            description=goal_data.description,
            goal_type=goal_data.goal_type.value,
            priority=goal_data.priority.value,
            specific_description=goal_data.specific_description,
            measurable_criteria=goal_data.measurable_criteria.dict(),
            achievable_plan=goal_data.achievable_plan,
            relevant_reason=goal_data.relevant_reason,
            time_bound_deadline=goal_data.time_bound_deadline,
            topic_id=goal_data.topic_id,
            pdf_id=goal_data.pdf_id,
            parent_goal_id=goal_data.parent_goal_id,
            target_value=goal_data.target_value,
            target_unit=goal_data.target_unit,
            target_date=goal_data.target_date,
            estimated_hours=goal_data.estimated_hours,
            difficulty_rating=goal_data.difficulty_rating,
            importance_rating=goal_data.importance_rating,
            motivation_notes=goal_data.motivation_notes,
            reward_description=goal_data.reward_description,
            reminder_frequency=goal_data.reminder_frequency,
            tags=goal_data.tags
        )
        
        self.db.add(goal)
        self.db.commit()
        self.db.refresh(goal)
        
        # Create default milestones
        self._create_default_milestones(goal)
        
        # Check for immediate achievements
        self._check_achievements(goal.id, "goal_created")
        
        logger.info(f"Goal created: {goal.id} - {goal.title}")
        return self._to_response(goal)
    
    def get_goal(self, goal_id: UUID) -> Optional[GoalResponse]:
        """Get goal by ID with computed properties"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            return None
        
        # Update computed properties
        self._update_goal_status(goal)
        
        return self._to_response(goal)
    
    def update_goal(self, goal_id: UUID, goal_update: GoalUpdate) -> Optional[GoalResponse]:
        """Update goal with change tracking"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            return None
        
        if goal.is_completed:
            raise ValueError("Cannot update completed goal")
        
        # Apply updates
        update_data = goal_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(goal, field):
                setattr(goal, field, value)
        
        goal.updated_at = datetime.utcnow()
        self.db.commit()
        self.db.refresh(goal)
        
        return self._to_response(goal)
    
    def update_progress(self, goal_id: UUID, progress_update: GoalProgressUpdate) -> GoalResponse:
        """Update goal progress with milestone and achievement checking"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise ValueError("Goal not found")
        
        if goal.is_completed:
            raise ValueError("Goal already completed")
        
        # Update progress
        goal.update_progress(
            progress_update.new_value,
            progress_update.session_id
        )
        
        # Log progress
        progress_log = GoalProgress(
            goal_id=goal_id,
            session_id=progress_update.session_id,
            previous_value=goal.current_value,
            new_value=progress_update.new_value,
            change_amount=progress_update.new_value - goal.current_value,
            progress_percentage=goal.completion_rate,
            activity_type=progress_update.activity_type,
            notes=progress_update.notes,
            automatic_update=True
        )
        self.db.add(progress_log)
        
        # Check milestones
        self._check_milestone_completion(goal)
        
        # Check achievements
        self._check_achievements(goal.id, "progress_update")
        
        self.db.commit()
        self.db.refresh(goal)
        
        return self._to_response(goal)
    
    def complete_goal(self, goal_id: UUID) -> GoalResponse:
        """Mark goal as completed with rewards"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            raise ValueError("Goal not found")
        
        if goal.is_completed:
            raise ValueError("Goal already completed")
        
        # Complete the goal
        goal.complete_goal()
        
        # Complete all remaining milestones
        milestones = self.db.query(Milestone).filter(
            and_(
                Milestone.goal_id == goal_id,
                Milestone.is_completed == False
            )
        ).all()
        
        for milestone in milestones:
            milestone.complete_milestone()
        
        # Check achievements
        self._check_achievements(goal.id, "goal_completed")
        
        self.db.commit()
        self.db.refresh(goal)
        
        logger.info(f"Goal completed: {goal.id} - XP earned: {goal.xp_reward}")
        return self._to_response(goal)
    
    def delete_goal(self, goal_id: UUID) -> bool:
        """Delete goal and associated data"""
        goal = self.db.query(Goal).filter(Goal.id == goal_id).first()
        if not goal:
            return False
        
        try:
            # Delete associated milestones and progress logs (cascade)
            self.db.delete(goal)
            self.db.commit()
            
            logger.info(f"Goal deleted: {goal_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting goal {goal_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def list_goals(self, params: GoalSearchParams) -> GoalList:
        """List goals with filtering and pagination"""
        query = self.db.query(Goal)
        
        # Apply filters
        if params.status:
            query = query.filter(Goal.status == params.status)
        if params.goal_type:
            query = query.filter(Goal.goal_type == params.goal_type)
        if params.priority:
            query = query.filter(Goal.priority == params.priority)
        if params.topic_id:
            query = query.filter(Goal.topic_id == params.topic_id)
        if params.is_overdue is not None:
            if params.is_overdue:
                query = query.filter(
                    and_(
                        Goal.target_date < datetime.utcnow(),
                        Goal.status != "completed"
                    )
                )
        if params.start_date:
            query = query.filter(Goal.created_at >= params.start_date)
        if params.end_date:
            query = query.filter(Goal.created_at <= params.end_date)
        
        # Apply sorting
        sort_column = getattr(Goal, params.sort_by, Goal.created_at)
        if params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (params.page - 1) * params.page_size
        goals = query.offset(offset).limit(params.page_size).all()
        
        # Update statuses
        for goal in goals:
            self._update_goal_status(goal)
        
        # Calculate summary stats
        active_count = self.db.query(Goal).filter(Goal.status == "active").count()
        completed_count = self.db.query(Goal).filter(Goal.status == "completed").count()
        overdue_count = self.db.query(Goal).filter(
            and_(
                Goal.target_date < datetime.utcnow(),
                Goal.status != "completed"
            )
        ).count()
        
        total_pages = (total + params.page_size - 1) // params.page_size
        
        return GoalList(
            goals=[self._to_response(goal) for goal in goals],
            total=total,
            active=active_count,
            completed=completed_count,
            overdue=overdue_count,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages
        )
    
    def get_goal_analytics(self, 
                          start_date: Optional[datetime] = None,
                          end_date: Optional[datetime] = None,
                          topic_id: Optional[UUID] = None) -> GoalAnalytics:
        """Generate comprehensive goal analytics"""
        query = self.db.query(Goal)
        
        # Apply filters
        if start_date:
            query = query.filter(Goal.created_at >= start_date)
        if end_date:
            query = query.filter(Goal.created_at <= end_date)
        if topic_id:
            query = query.filter(Goal.topic_id == topic_id)
        
        goals = query.all()
        
        if not goals:
            return GoalAnalytics(
                total_goals=0,
                active_goals=0,
                completed_goals=0,
                overdue_goals=0,
                completion_rate=0.0,
                average_completion_time_days=0.0,
                total_xp_earned=0,
                current_streak=0,
                best_streak=0,
                goals_by_type={},
                goals_by_priority={},
                goals_by_status={},
                completion_rate_by_type={},
                average_goal_duration=0.0,
                consistency_score=0.0,
                top_achievement_categories=[],
                improvement_suggestions=[],
                next_milestones=[]
            )
        
        # Basic counts
        total_goals = len(goals)
        active_goals = len([g for g in goals if g.status == "active"])
        completed_goals = len([g for g in goals if g.status == "completed"])
        overdue_goals = len([g for g in goals if g.is_overdue])
        
        # Completion rate
        completion_rate = (completed_goals / total_goals) * 100 if total_goals > 0 else 0
        
        # Average completion time
        completed = [g for g in goals if g.completed_date and g.created_at]
        avg_completion_time = 0.0
        if completed:
            completion_times = [(g.completed_date - g.created_at).days for g in completed]
            avg_completion_time = statistics.mean(completion_times)
        
        # XP and streaks
        total_xp = sum(g.xp_earned for g in goals)
        current_streak = self._calculate_current_streak()
        best_streak = self._calculate_best_streak()
        
        # Breakdowns
        goals_by_type = self._count_by_field(goals, 'goal_type')
        goals_by_priority = self._count_by_field(goals, 'priority')
        goals_by_status = self._count_by_field(goals, 'status')
        
        # Completion rates by type
        completion_by_type = {}
        for goal_type in goals_by_type:
            type_goals = [g for g in goals if g.goal_type == goal_type]
            type_completed = len([g for g in type_goals if g.is_completed])
            completion_by_type[goal_type] = (type_completed / len(type_goals)) * 100 if type_goals else 0
        
        # Duration analysis
        goal_durations = []
        for goal in goals:
            if goal.target_date and goal.created_at:
                duration = (goal.target_date - goal.created_at).days
                goal_durations.append(duration)
        
        avg_duration = statistics.mean(goal_durations) if goal_durations else 0
        
        # Consistency score (based on regular progress updates)
        consistency_score = self._calculate_consistency_score(goals)
        
        # Next milestones
        next_milestones = self._get_upcoming_milestones(5)
        
        return GoalAnalytics(
            total_goals=total_goals,
            active_goals=active_goals,
            completed_goals=completed_goals,
            overdue_goals=overdue_goals,
            completion_rate=completion_rate,
            average_completion_time_days=avg_completion_time,
            total_xp_earned=total_xp,
            current_streak=current_streak,
            best_streak=best_streak,
            goals_by_type=goals_by_type,
            goals_by_priority=goals_by_priority,
            goals_by_status=goals_by_status,
            completion_rate_by_type=completion_by_type,
            average_goal_duration=avg_duration,
            consistency_score=consistency_score,
            top_achievement_categories=["study", "consistency", "achievement"],
            improvement_suggestions=self._generate_improvement_suggestions(goals),
            next_milestones=next_milestones
        )
    
    def get_goal_dashboard(self) -> GoalDashboard:
        """Get complete goal dashboard"""
        # Get analytics
        analytics = self.get_goal_analytics()
        
        # Get active goals
        active_goals = self.db.query(Goal).filter(Goal.status == "active").limit(10).all()
        
        # Get upcoming deadlines
        upcoming = self.db.query(Goal).filter(
            and_(
                Goal.target_date >= datetime.utcnow(),
                Goal.target_date <= datetime.utcnow() + timedelta(days=7),
                Goal.status == "active"
            )
        ).order_by(Goal.target_date.asc()).limit(5).all()
        
        # Get recent achievements (placeholder)
        recent_achievements = []
        
        # Get pending milestones
        pending_milestones = self.db.query(Milestone).filter(
            Milestone.is_completed == False
        ).limit(5).all()
        
        return GoalDashboard(
            summary=analytics,
            active_goals=[self._to_response(g) for g in active_goals],
            upcoming_deadlines=[self._to_response(g) for g in upcoming],
            recent_achievements=recent_achievements,
            pending_milestones=[self._milestone_to_response(m) for m in pending_milestones],
            insights=[],
            recommendations=[],
            streaks={"current": analytics.current_streak, "best": analytics.best_streak},
            weekly_progress=self._calculate_weekly_progress()
        )
    
    def get_goal_recommendations(self, limit: int = 5) -> List[GoalRecommendation]:
        """Generate AI-powered goal recommendations"""
        recommendations = []
        
        # Analyze current goals and study patterns
        active_goals = self.db.query(Goal).filter(Goal.status == "active").all()
        topics = self.db.query(Topic).filter(Topic.is_archived == False).all()
        
        # Recommendation 1: Topic-based goals for unstudied topics
        for topic in topics[:3]:
            if not any(g.topic_id == topic.id for g in active_goals):
                recommendations.append(GoalRecommendation(
                    title=f"Complete {topic.name} Study Materials",
                    description=f"Set a goal to complete all PDFs in {topic.name}",
                    goal_type="completion",
                    estimated_difficulty=topic.difficulty_level,
                    estimated_duration_weeks=4,
                    related_topic_id=topic.id,
                    rationale=f"No active goals for {topic.name} topic",
                    confidence_score=0.8
                ))
        
        # Recommendation 2: Time-based goals
        if not any(g.goal_type == "time_based" for g in active_goals):
            recommendations.append(GoalRecommendation(
                title="Daily Study Habit",
                description="Study for 60 minutes every day for 30 days",
                goal_type="habit",
                estimated_difficulty=3,
                estimated_duration_weeks=4,
                rationale="No time-based goals detected",
                confidence_score=0.9
            ))
        
        # Recommendation 3: Performance improvement
        recommendations.append(GoalRecommendation(
            title="Improve Reading Speed",
            description="Increase reading speed to 300 words per minute",
            goal_type="performance",
            estimated_difficulty=3,
            estimated_duration_weeks=6,
            rationale="Performance goals help track skill development",
            confidence_score=0.7
        ))
        
        return recommendations[:limit]
    
    def create_bulk_goals(self, bulk_data: BulkGoalCreate) -> BulkGoalResponse:
        """Create multiple goals at once"""
        successful = []
        failed = []
        
        for goal_data in bulk_data.goals:
            try:
                goal = self.create_goal(goal_data)
                successful.append(goal.id)
            except Exception as e:
                failed.append({
                    "goal_data": goal_data.dict(),
                    "error": str(e)
                })
        
        return BulkGoalResponse(
            successful=successful,
            failed=failed,
            total_processed=len(bulk_data.goals),
            success_count=len(successful),
            failure_count=len(failed)
        )
    
    def sync_all_goal_progress(self) -> int:
        """Sync goal progress with actual study data"""
        updated_count = 0
        active_goals = self.db.query(Goal).filter(Goal.status == "active").all()
        
        for goal in active_goals:
            try:
                # Sync based on goal type
                if goal.goal_type == "time_based" and goal.topic_id:
                    # Get total study time for topic
                    # This would integrate with sessions data
                    pass
                elif goal.goal_type == "completion" and goal.pdf_id:
                    # Check PDF completion status
                    pdf = self.db.query(PDF).filter(PDF.id == goal.pdf_id).first()
                    if pdf and pdf.is_completed and goal.current_value < goal.target_value:
                        goal.update_progress(goal.target_value)
                        updated_count += 1
                
            except Exception as e:
                logger.error(f"Error syncing goal {goal.id}: {str(e)}")
                continue
        
        self.db.commit()
        return updated_count
    
    def get_goal_templates(self, category: Optional[str] = None, difficulty: Optional[int] = None):
        """Get predefined goal templates"""
        templates = [
            {
                "name": "Daily Study Habit",
                "description": "Build consistent daily study routine",
                "goal_type": "habit",
                "template_data": {
                    "title": "Study Daily for 30 Days",
                    "target_value": 30,
                    "target_unit": "days",
                    "difficulty_rating": 3,
                    "estimated_hours": 30
                },
                "category": "consistency",
                "difficulty_level": 3
            },
            {
                "name": "Complete Course",
                "description": "Finish all materials in a topic",
                "goal_type": "completion",
                "template_data": {
                    "title": "Complete All PDFs in Topic",
                    "target_value": 100,
                    "target_unit": "percentage",
                    "difficulty_rating": 2,
                    "estimated_hours": 20
                },
                "category": "completion",
                "difficulty_level": 2
            }
        ]
        
        # Apply filters
        if category:
            templates = [t for t in templates if t["category"] == category]
        if difficulty:
            templates = [t for t in templates if t["difficulty_level"] == difficulty]
        
        return templates
    
    def get_stats_summary(self):
        """Get quick statistics summary"""
        total_goals = self.db.query(Goal).count()
        active_goals = self.db.query(Goal).filter(Goal.status == "active").count()
        completed_goals = self.db.query(Goal).filter(Goal.status == "completed").count()
        overdue_goals = self.db.query(Goal).filter(
            and_(
                Goal.target_date < datetime.utcnow(),
                Goal.status != "completed"
            )
        ).count()
        
        return {
            "total_goals": total_goals,
            "active_goals": active_goals,
            "completed_goals": completed_goals,
            "overdue_goals": overdue_goals,
            "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0
        }
    
    # Private helper methods
    
    def _validate_smart_goal(self, goal_data: GoalCreate):
        """Validate SMART criteria"""
        # Specific: title and description should be clear
        if len(goal_data.specific_description) < 10:
            raise ValueError("Specific description must be at least 10 characters")
        
        # Measurable: must have valid criteria
        if goal_data.target_value <= 0:
            raise ValueError("Target value must be positive")
        
        # Achievable: check if plan is provided
        if len(goal_data.achievable_plan) < 10:
            raise ValueError("Achievable plan must be at least 10 characters")
        
        # Relevant: check if reason is provided
        if len(goal_data.relevant_reason) < 10:
            raise ValueError("Relevant reason must be at least 10 characters")
        
        # Time-bound: deadline must be in future
        if goal_data.time_bound_deadline <= datetime.utcnow():
            raise ValueError("Deadline must be in the future")
    
    def _create_default_milestones(self, goal: Goal):
        """Create default milestones for a goal"""
        milestone_percentages = [25, 50, 75, 100]
        
        for i, percentage in enumerate(milestone_percentages):
            milestone = Milestone(
                goal_id=goal.id,
                title=f"{percentage}% Complete",
                description=f"Reach {percentage}% completion of {goal.title}",
                target_percentage=percentage,
                order_sequence=i + 1,
                xp_reward=25 if percentage < 100 else 50
            )
            self.db.add(milestone)
        
        self.db.commit()
    
    def _update_goal_status(self, goal: Goal):
        """Update goal status based on current state"""
        if goal.is_overdue and goal.status == "active":
            goal.status = "overdue"
        elif goal.completion_rate >= 100 and goal.status != "completed":
            goal.status = "completed"
            goal.completed_date = datetime.utcnow()
    
    def _check_milestone_completion(self, goal: Goal):
        """Check and complete milestones based on progress"""
        milestones = self.db.query(Milestone).filter(
            and_(
                Milestone.goal_id == goal.id,
                Milestone.is_completed == False,
                Milestone.target_percentage <= goal.completion_rate
            )
        ).all()
        
        for milestone in milestones:
            milestone.complete_milestone()
            goal.xp_earned += milestone.xp_reward
    
    def _check_achievements(self, goal_id: UUID, trigger_type: str):
        """Check and unlock achievements"""
        # Placeholder for achievement checking logic
        # Would check various achievement criteria and unlock badges
        pass
    
    def _to_response(self, goal: Goal) -> GoalResponse:
        """Convert goal model to response schema"""
        return GoalResponse(
            id=goal.id,
            title=goal.title,
            description=goal.description,
            goal_type=goal.goal_type,
            status=goal.status,
            priority=goal.priority,
            specific_description=goal.specific_description,
            measurable_criteria=goal.measurable_criteria,
            achievable_plan=goal.achievable_plan,
            relevant_reason=goal.relevant_reason,
            time_bound_deadline=goal.time_bound_deadline,
            topic_id=goal.topic_id,
            pdf_id=goal.pdf_id,
            parent_goal_id=goal.parent_goal_id,
            target_value=goal.target_value,
            current_value=goal.current_value,
            target_unit=goal.target_unit,
            progress_percentage=float(goal.progress_percentage) if goal.progress_percentage else 0.0,
            streak_count=goal.streak_count,
            best_streak=goal.best_streak,
            consistency_score=float(goal.consistency_score) if goal.consistency_score else 0.0,
            last_activity_date=goal.last_activity_date,
            start_date=goal.start_date,
            target_date=goal.target_date,
            completed_date=goal.completed_date,
            estimated_hours=goal.estimated_hours,
            actual_hours=goal.actual_hours,
            difficulty_rating=goal.difficulty_rating,
            importance_rating=goal.importance_rating,
            motivation_notes=goal.motivation_notes,
            reward_description=goal.reward_description,
            reminder_frequency=goal.reminder_frequency,
            tags=goal.tags or [],
            xp_reward=goal.xp_reward,
            badges_earned=goal.badges_earned or [],
            milestones_count=goal.milestones_count,
            sub_goals_count=goal.sub_goals_count,
            goal_metadata=goal.goal_metadata or {},
            created_at=goal.created_at,
            updated_at=goal.updated_at,
            is_completed=goal.is_completed,
            is_overdue=goal.is_overdue,
            days_remaining=goal.days_remaining,
            completion_rate=goal.completion_rate
        )
    
    def _count_by_field(self, goals: List[Goal], field: str) -> Dict[str, int]:
        """Count goals by a specific field"""
        counts = {}
        for goal in goals:
            value = getattr(goal, field, "unknown")
            counts[value] = counts.get(value, 0) + 1
        return counts
    
    def _calculate_current_streak(self) -> int:
        """Calculate current goal completion streak"""
        # Simplified implementation
        return 5
    
    def _calculate_best_streak(self) -> int:
        """Calculate best ever goal completion streak"""
        # Simplified implementation
        return 12
    
    def _calculate_consistency_score(self, goals: List[Goal]) -> float:
        """Calculate consistency score based on regular progress"""
        if not goals:
            return 0.0
        
        # Check how many goals have regular progress updates
        consistent_goals = 0
        for goal in goals:
            progress_logs = self.db.query(GoalProgress).filter(
                GoalProgress.goal_id == goal.id
            ).count()
            
            if progress_logs >= 3:  # At least 3 progress updates
                consistent_goals += 1
        
        return (consistent_goals / len(goals)) * 100 if goals else 0.0
    
    def _get_upcoming_milestones(self, limit: int) -> List[MilestoneResponse]:
        """Get upcoming milestones across all goals"""
        milestones = self.db.query(Milestone).filter(
            Milestone.is_completed == False
        ).limit(limit).all()
        
        return [self._milestone_to_response(m) for m in milestones]
    
    def _milestone_to_response(self, milestone: Milestone) -> MilestoneResponse:
        """Convert milestone model to response"""
        return MilestoneResponse(
            id=milestone.id,
            goal_id=milestone.goal_id,
            title=milestone.title,
            description=milestone.description,
            target_percentage=float(milestone.target_percentage),
            order_sequence=milestone.order_sequence,
            target_value=milestone.target_value,
            is_completed=milestone.is_completed,
            completed_date=milestone.completed_date,
            xp_reward=milestone.xp_reward,
            badge_name=milestone.badge_name,
            celebration_message=milestone.celebration_message,
            created_at=milestone.created_at,
            updated_at=milestone.updated_at
        )
    
    def _generate_improvement_suggestions(self, goals: List[Goal]) -> List[str]:
        """Generate improvement suggestions based on goal patterns"""
        suggestions = []
        
        if not goals:
            suggestions.append("Create your first SMART goal to get started")
            return suggestions
        
        completed_rate = len([g for g in goals if g.is_completed]) / len(goals)
        overdue_count = len([g for g in goals if g.is_overdue])
        
        if completed_rate < 0.5:
            suggestions.append("Focus on completing existing goals before creating new ones")
        
        if overdue_count > 0:
            suggestions.append(f"Review {overdue_count} overdue goals and adjust deadlines")
        
        if completed_rate > 0.8:
            suggestions.append("Great progress! Consider setting more challenging goals")
        
        return suggestions
    
    def _calculate_weekly_progress(self) -> Dict[str, float]:
        """Calculate weekly progress metrics"""
        # Get goals with progress in last 7 days
        week_ago = datetime.utcnow() - timedelta(days=7)
        
        recent_progress = self.db.query(GoalProgress).filter(
            GoalProgress.recorded_at >= week_ago
        ).all()
        
        # Calculate daily progress
        daily_progress = {}
        for i in range(7):
            day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
            day_progress = [p for p in recent_progress if p.recorded_at.strftime("%Y-%m-%d") == day]
            daily_progress[day] = sum(p.change_amount for p in day_progress if p.change_amount > 0)
        
        return daily_progress


class MilestoneService:
    """Service for milestone management"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_milestone(self, milestone_data: MilestoneCreate) -> MilestoneResponse:
        """Create a new milestone"""
        # Validate goal exists
        goal = self.db.query(Goal).filter(Goal.id == milestone_data.goal_id).first()
        if not goal:
            raise ValueError("Goal not found")
        
        milestone = Milestone(
            goal_id=milestone_data.goal_id,
            title=milestone_data.title,
            description=milestone_data.description,
            target_percentage=milestone_data.target_percentage,
            order_sequence=milestone_data.order_sequence,
            xp_reward=milestone_data.xp_reward,
            badge_name=milestone_data.badge_name,
            celebration_message=milestone_data.celebration_message
        )
        
        self.db.add(milestone)
        self.db.commit()
        self.db.refresh(milestone)
        
        return self._to_response(milestone)
    
    def get_goal_milestones(self, goal_id: UUID) -> List[MilestoneResponse]:
        """Get all milestones for a goal"""
        milestones = self.db.query(Milestone).filter(
            Milestone.goal_id == goal_id
        ).order_by(Milestone.order_sequence.asc()).all()
        
        return [self._to_response(m) for m in milestones]
    
    def complete_milestone(self, milestone_id: UUID) -> MilestoneResponse:
        """Mark milestone as completed"""
        milestone = self.db.query(Milestone).filter(Milestone.id == milestone_id).first()
        if not milestone:
            raise ValueError("Milestone not found")
        
        if milestone.is_completed:
            raise ValueError("Milestone already completed")
        
        milestone.complete_milestone()
        self.db.commit()
        self.db.refresh(milestone)
        
        return self._to_response(milestone)
    
    def _to_response(self, milestone: Milestone) -> MilestoneResponse:
        """Convert milestone to response schema"""
        return MilestoneResponse(
            id=milestone.id,
            goal_id=milestone.goal_id,
            title=milestone.title,
            description=milestone.description,
            target_percentage=float(milestone.target_percentage),
            order_sequence=milestone.order_sequence,
            target_value=milestone.target_value,
            is_completed=milestone.is_completed,
            completed_date=milestone.completed_date,
            xp_reward=milestone.xp_reward,
            badge_name=milestone.badge_name,
            celebration_message=milestone.celebration_message,
            created_at=milestone.created_at,
            updated_at=milestone.updated_at
        )


class AchievementService:
    """Service for achievement and gamification system"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def list_achievements(self, category: Optional[str] = None, 
                         rarity: Optional[str] = None, 
                         unlocked_only: bool = False) -> List[AchievementResponse]:
        """List available achievements"""
        query = self.db.query(Achievement).filter(Achievement.is_active == True)
        
        if category:
            query = query.filter(Achievement.category == category)
        if rarity:
            query = query.filter(Achievement.rarity == rarity)
        
        achievements = query.all()
        
        return [self._to_response(a) for a in achievements]
    
    def get_user_achievements(self, user_id: str) -> List[UserAchievementResponse]:
        """Get achievements earned by user"""
        user_achievements = self.db.query(UserAchievement).filter(
            UserAchievement.user_id == user_id
        ).all()
        
        return [self._user_achievement_to_response(ua) for ua in user_achievements]
    
    def get_achievement_progress(self, user_id: str) -> Dict[str, Any]:
        """Get progress towards unearned achievements"""
        # Placeholder for achievement progress tracking
        return {
            "available_achievements": 15,
            "earned_achievements": 3,
            "progress_towards_next": [
                {
                    "achievement_name": "Study Streak",
                    "current_progress": 5,
                    "required_progress": 7,
                    "progress_percentage": 71.4
                }
            ]
        }
    
    def _to_response(self, achievement: Achievement) -> AchievementResponse:
        """Convert achievement to response schema"""
        return AchievementResponse(
            id=achievement.id,
            name=achievement.name,
            description=achievement.description,
            category=achievement.category,
            badge_icon=achievement.badge_icon,
            badge_color=achievement.badge_color,
            criteria_type=achievement.criteria_type,
            criteria_value=achievement.criteria_value,
            criteria_description=achievement.criteria_description,
            xp_reward=achievement.xp_reward,
            rarity=achievement.rarity,
            unlock_level=achievement.unlock_level,
            is_active=achievement.is_active,
            created_at=achievement.created_at
        )
    
    def _user_achievement_to_response(self, user_achievement: UserAchievement) -> UserAchievementResponse:
        """Convert user achievement to response schema"""
        return UserAchievementResponse(
            id=user_achievement.id,
            achievement=self._to_response(user_achievement.achievement),
            user_id=user_achievement.user_id,
            earned_at=user_achievement.earned_at,
            progress_value=user_achievement.progress_value,
            notes=user_achievement.notes,
            triggered_by_goal=user_achievement.triggered_by_goal,
            triggered_by_session=user_achievement.triggered_by_session
        )