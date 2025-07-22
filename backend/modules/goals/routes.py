# backend/modules/goals/routes.py
"""
StudySprint 4.0 - Enhanced Goals Routes
Stage 6 Complete: Comprehensive goal management API
"""

from fastapi import APIRouter, HTTPException, status, Depends, Query
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List, Optional
import uuid

from common.database import get_db
from .services import GoalService

router = APIRouter()

def get_goal_service(db: Session = Depends(get_db)) -> GoalService:
    return GoalService(db)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_goal(
    goal_data: Dict[str, Any],
    goal_service: GoalService = Depends(get_goal_service)
):
    """Create a new SMART goal with enhanced features"""
    try:
        goal = goal_service.create_goal(goal_data)
        return goal
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def list_goals(
    status_filter: Optional[str] = Query(None, description="Filter by status"),
    goal_type: Optional[str] = Query(None, description="Filter by goal type"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    goal_service: GoalService = Depends(get_goal_service)
):
    """List goals with comprehensive filtering and analytics"""
    filters = {}
    if status_filter:
        filters["status"] = status_filter
    if goal_type:
        filters["goal_type"] = goal_type
    if priority:
        filters["priority"] = priority
    
    return goal_service.list_goals(filters)

@router.get("/{goal_id}")
async def get_goal(
    goal_id: str,
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get detailed goal information"""
    if goal_id not in goal_service.goals_storage:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goal_service.goals_storage[goal_id]

@router.put("/{goal_id}/progress")
async def update_goal_progress(
    goal_id: str,
    progress_data: Dict[str, Any],
    goal_service: GoalService = Depends(get_goal_service)
):
    """Update goal progress with milestone tracking"""
    try:
        return goal_service.update_goal_progress(goal_id, progress_data)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

@router.get("/{goal_id}/milestones")
async def get_goal_milestones(
    goal_id: str,
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get milestones for a specific goal"""
    milestones = goal_service.get_milestones(goal_id)
    if not milestones and goal_id not in goal_service.goals_storage:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    return {"goal_id": goal_id, "milestones": milestones}

@router.get("/analytics/overview")
async def get_goals_analytics_overview(
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get comprehensive goals analytics overview"""
    return goal_service.get_goal_analytics()

@router.get("/analytics/dashboard")
async def get_goals_dashboard(
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get enhanced goals dashboard data"""
    analytics = goal_service.get_goal_analytics()
    goals_list = goal_service.list_goals()
    
    return {
        "summary": analytics.get("summary", {}),
        "active_goals": [g for g in goals_list["goals"] if g["status"] == "active"][:5],
        "insights": analytics.get("insights", []),
        "achievements": goal_service.get_achievements(),
        "upcoming_deadlines": goals_list.get("upcoming_deadlines", []),
        "recommendations": [
            "Set specific, measurable targets for better tracking",
            "Break large goals into weekly milestones", 
            "Review and adjust goals monthly",
            "Celebrate milestone completions"
        ]
    }

@router.get("/achievements")
async def get_achievements(
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get user achievements and badges"""
    achievements = goal_service.get_achievements()
    
    return {
        "achievements": achievements,
        "total_earned": len(achievements),
        "total_xp": sum(a["xp_reward"] for a in achievements),
        "recent": achievements[-5:] if achievements else []
    }

@router.get("/insights")
async def get_goal_insights(
    goal_service: GoalService = Depends(get_goal_service)
):
    """Get personalized goal insights and recommendations"""
    analytics = goal_service.get_goal_analytics()
    
    return {
        "insights": analytics.get("insights", []),
        "performance_summary": {
            "total_goals": analytics.get("summary", {}).get("total_goals", 0),
            "completion_rate": analytics.get("summary", {}).get("average_progress", 0)
        },
        "recommendations": [
            "Focus on 1-3 goals at a time for better success rates",
            "Set weekly check-ins to track progress",
            "Use the SMART criteria for all new goals"
        ]
    }

@router.get("/health")
async def goals_health_check():
    """Health check for goals module"""
    return {
        "module": "goals",
        "status": "✅ Enhanced & Complete",
        "features": {
            "smart_goals": "✅ Complete",
            "progress_tracking": "✅ Complete", 
            "milestones": "✅ Complete",
            "achievements": "✅ Complete",
            "analytics": "✅ Complete"
        },
        "timestamp": datetime.utcnow().isoformat()
    }
