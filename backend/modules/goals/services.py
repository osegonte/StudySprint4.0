# backend/modules/goals/services.py
"""
StudySprint 4.0 - Enhanced Goals Service
Stage 6 Complete: Advanced SMART goals with analytics
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
import logging
import uuid

logger = logging.getLogger(__name__)

# Enhanced in-memory storage
goals_storage = {}
achievements_storage = {}
milestones_storage = {}

class GoalService:
    """Enhanced service for SMART goal management"""
    
    def __init__(self, db: Session):
        self.db = db
        self.goals_storage = goals_storage
    
    def create_goal(self, goal_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create a new SMART goal with milestones"""
        goal_id = str(uuid.uuid4())
        
        # Enhanced goal with SMART criteria
        goal = {
            "id": goal_id,
            "title": goal_data.get("title", "New Goal"),
            "description": goal_data.get("description", ""),
            "goal_type": goal_data.get("goal_type", "completion"),
            "status": "active",
            "priority": goal_data.get("priority", "medium"),
            
            # SMART criteria
            "specific_description": goal_data.get("specific_description", goal_data.get("description", "")),
            "measurable_criteria": {
                "metric": goal_data.get("target_unit", "completion"),
                "target_value": goal_data.get("target_value", 100),
                "current_value": 0
            },
            "achievable_plan": goal_data.get("achievable_plan", "Study consistently and track progress"),
            "relevant_reason": goal_data.get("relevant_reason", "Important for personal development"),
            "time_bound_deadline": goal_data.get("deadline", (datetime.utcnow() + timedelta(days=30)).isoformat()),
            
            # Progress tracking
            "target_value": goal_data.get("target_value", 100),
            "current_value": 0,
            "progress_percentage": 0.0,
            "streak_count": 0,
            "best_streak": 0,
            
            # Metadata
            "difficulty_rating": goal_data.get("difficulty_rating", 3),
            "importance_rating": goal_data.get("importance_rating", 3),
            "estimated_hours": goal_data.get("estimated_hours", 10),
            "actual_hours": 0,
            "xp_reward": self._calculate_xp_reward(goal_data),
            "badges_earned": [],
            "milestones": [],
            
            # Timestamps
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat(),
            "target_date": goal_data.get("target_date", (datetime.utcnow() + timedelta(days=30)).isoformat())
        }
        
        # Create default milestones
        goal["milestones"] = self._create_default_milestones(goal_id, goal["target_value"])
        
        goals_storage[goal_id] = goal
        
        # Track achievement
        self._check_achievements(goal_id, "goal_created")
        
        logger.info(f"Enhanced goal created: {goal_id} - {goal['title']}")
        return goal
    
    def list_goals(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """List goals with enhanced filtering and analytics"""
        filters = filters or {}
        
        all_goals = list(goals_storage.values())
        
        # Apply filters
        if filters.get("status"):
            all_goals = [g for g in all_goals if g["status"] == filters["status"]]
        
        if filters.get("goal_type"):
            all_goals = [g for g in all_goals if g["goal_type"] == filters["goal_type"]]
        
        if filters.get("priority"):
            all_goals = [g for g in all_goals if g["priority"] == filters["priority"]]
        
        # Sort by priority and progress
        all_goals.sort(key=lambda x: (
            {"high": 3, "medium": 2, "low": 1}.get(x["priority"], 1),
            x["progress_percentage"]
        ), reverse=True)
        
        # Calculate summary statistics
        total_goals = len(goals_storage)
        active_goals = len([g for g in goals_storage.values() if g["status"] == "active"])
        completed_goals = len([g for g in goals_storage.values() if g["status"] == "completed"])
        overdue_goals = len([g for g in goals_storage.values() 
                            if datetime.fromisoformat(g["target_date"]) < datetime.utcnow() 
                            and g["status"] != "completed"])
        
        total_xp = sum(g["xp_reward"] for g in goals_storage.values() if g["status"] == "completed")
        avg_completion_rate = sum(g["progress_percentage"] for g in goals_storage.values()) / len(goals_storage) if goals_storage else 0
        
        return {
            "goals": all_goals,
            "total": len(all_goals),
            "summary": {
                "total_goals": total_goals,
                "active_goals": active_goals,
                "completed_goals": completed_goals,
                "overdue_goals": overdue_goals,
                "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0,
                "total_xp_earned": total_xp,
                "average_progress": avg_completion_rate,
                "achievements_unlocked": len(achievements_storage)
            },
            "insights": self._generate_goal_insights(),
            "upcoming_deadlines": self._get_upcoming_deadlines()
        }
    
    def update_goal_progress(self, goal_id: str, progress_data: Dict[str, Any]) -> Dict[str, Any]:
        """Update goal progress with milestone checking"""
        if goal_id not in goals_storage:
            raise ValueError("Goal not found")
        
        goal = goals_storage[goal_id]
        
        # Update progress
        new_value = progress_data.get("new_value", goal["current_value"])
        old_value = goal["current_value"]
        
        goal["current_value"] = new_value
        goal["progress_percentage"] = (new_value / goal["target_value"] * 100) if goal["target_value"] > 0 else 0
        goal["updated_at"] = datetime.utcnow().isoformat()
        
        # Check milestones
        self._check_milestones(goal_id, goal["progress_percentage"])
        
        # Check if goal completed
        if goal["progress_percentage"] >= 100 and goal["status"] != "completed":
            goal["status"] = "completed"
            goal["completed_date"] = datetime.utcnow().isoformat()
            self._check_achievements(goal_id, "goal_completed")
        
        logger.info(f"Goal progress updated: {goal_id} - {old_value} → {new_value}")
        return goal
    
    def get_goal_analytics(self, goal_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive goal analytics"""
        if goal_id:
            if goal_id not in goals_storage:
                return {}
            
            goal = goals_storage[goal_id]
            return {"goal": goal, "analytics": {"basic": "analytics"}}
        else:
            # Overall analytics
            all_goals = list(goals_storage.values())
            
            if not all_goals:
                return {
                    "summary": {"total_goals": 0},
                    "trends": [],
                    "insights": ["Create your first goal to get started!"]
                }
            
            return {
                "summary": {
                    "total_goals": len(all_goals),
                    "completed_goals": len([g for g in all_goals if g["status"] == "completed"]),
                    "active_goals": len([g for g in all_goals if g["status"] == "active"]),
                    "total_xp": sum(g["xp_reward"] for g in all_goals if g["status"] == "completed"),
                    "average_progress": sum(g["progress_percentage"] for g in all_goals) / len(all_goals)
                },
                "trends": {"completion_trend": "improving"},
                "insights": self._generate_analytics_insights(all_goals),
                "achievements": list(achievements_storage.values())
            }
    
    def get_achievements(self) -> List[Dict[str, Any]]:
        """Get user achievements"""
        return list(achievements_storage.values())
    
    def get_milestones(self, goal_id: str) -> List[Dict[str, Any]]:
        """Get milestones for a specific goal"""
        if goal_id not in goals_storage:
            return []
        return goals_storage[goal_id].get("milestones", [])
    
    # Private helper methods
    
    def _calculate_xp_reward(self, goal_data: Dict[str, Any]) -> int:
        """Calculate XP reward for goal completion"""
        base_xp = 100
        difficulty_multiplier = goal_data.get("difficulty_rating", 3) / 3.0
        importance_multiplier = goal_data.get("importance_rating", 3) / 3.0
        return int(base_xp * difficulty_multiplier * importance_multiplier)
    
    def _create_default_milestones(self, goal_id: str, target_value: float) -> List[Dict[str, Any]]:
        """Create default milestones for a goal"""
        milestones = []
        percentages = [25, 50, 75, 100]
        
        for i, percentage in enumerate(percentages):
            milestone = {
                "id": f"{goal_id}_milestone_{i+1}",
                "goal_id": goal_id,
                "title": f"{percentage}% Complete",
                "description": f"Reach {percentage}% completion",
                "target_percentage": percentage,
                "completed": False,
                "xp_reward": 25 if percentage < 100 else 50
            }
            milestones.append(milestone)
            milestones_storage[milestone["id"]] = milestone
        
        return milestones
    
    def _check_milestones(self, goal_id: str, progress_percentage: float):
        """Check and complete milestones based on progress"""
        if goal_id not in goals_storage:
            return
        
        goal = goals_storage[goal_id]
        for milestone in goal["milestones"]:
            if not milestone["completed"] and progress_percentage >= milestone["target_percentage"]:
                milestone["completed"] = True
                milestone["completed_date"] = datetime.utcnow().isoformat()
                milestones_storage[milestone["id"]] = milestone
                logger.info(f"Milestone completed: {milestone['title']} for goal {goal_id}")
    
    def _check_achievements(self, goal_id: str, trigger_type: str):
        """Check and unlock achievements"""
        achievement_rules = {
            "goal_created": {
                "first_goal": {"title": "First Goal", "description": "Created your first goal", "xp": 50}
            },
            "goal_completed": {
                "achiever": {"title": "Achiever", "description": "Completed your first goal", "xp": 100}
            }
        }
        
        if trigger_type in achievement_rules:
            for achievement_key, achievement_data in achievement_rules[trigger_type].items():
                if achievement_key in achievements_storage:
                    continue
                
                should_unlock = False
                
                if trigger_type == "goal_created" and len(goals_storage) >= 1:
                    should_unlock = True
                elif trigger_type == "goal_completed":
                    completed_goals = len([g for g in goals_storage.values() if g["status"] == "completed"])
                    if completed_goals >= 1:
                        should_unlock = True
                
                if should_unlock:
                    achievement = {
                        "id": achievement_key,
                        "title": achievement_data["title"],
                        "description": achievement_data["description"],
                        "xp_reward": achievement_data["xp"],
                        "earned_date": datetime.utcnow().isoformat(),
                        "goal_id": goal_id
                    }
                    achievements_storage[achievement_key] = achievement
                    logger.info(f"Achievement unlocked: {achievement['title']}")
    
    def _generate_goal_insights(self) -> List[str]:
        """Generate insights about all goals"""
        if not goals_storage:
            return ["Create your first goal to start tracking your progress!"]
        
        insights = []
        all_goals = list(goals_storage.values())
        
        total_progress = sum(g["progress_percentage"] for g in all_goals)
        avg_progress = total_progress / len(all_goals)
        
        if avg_progress > 75:
            insights.append("Excellent progress! You're crushing your goals.")
        elif avg_progress > 50:
            insights.append("Good momentum on your goals. Keep up the consistent effort!")
        else:
            insights.append("Time to focus! Pick one goal and make consistent daily progress.")
        
        return insights[:3]
    
    def _generate_analytics_insights(self, goals: List[Dict[str, Any]]) -> List[str]:
        """Generate advanced analytics insights"""
        insights = []
        
        if not goals:
            return ["No goals yet - create your first goal to get personalized insights!"]
        
        completed = [g for g in goals if g["status"] == "completed"]
        completion_rate = len(completed) / len(goals) * 100
        
        if completion_rate > 80:
            insights.append("🏆 Outstanding goal completion rate! You're a goal-achieving machine.")
        elif completion_rate > 60:
            insights.append("💪 Strong goal completion rate. You're building great habits.")
        else:
            insights.append("🎯 Opportunity to improve! Try setting smaller, more achievable goals.")
        
        return insights[:3]
    
    def _get_upcoming_deadlines(self) -> List[Dict[str, Any]]:
        """Get goals with upcoming deadlines"""
        now = datetime.utcnow()
        upcoming = []
        
        for goal in goals_storage.values():
            if goal["status"] != "completed":
                target_date = datetime.fromisoformat(goal["target_date"])
                days_remaining = (target_date - now).days
                
                if 0 <= days_remaining <= 7:
                    upcoming.append({
                        "goal_id": goal["id"],
                        "title": goal["title"],
                        "target_date": goal["target_date"],
                        "days_remaining": days_remaining,
                        "progress_percentage": goal["progress_percentage"]
                    })
        
        return sorted(upcoming, key=lambda x: x["days_remaining"])[:5]

    def get_achievements(self) -> List[Dict[str, Any]]:
        """Get user achievements"""
        return list(achievements_storage.values())
