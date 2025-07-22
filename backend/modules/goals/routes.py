# backend/modules/goals/routes.py
from fastapi import APIRouter, HTTPException, status
from datetime import datetime
from typing import Dict, Any
import uuid

router = APIRouter()

# Simple in-memory storage for demo
goals_storage = {}

@router.post("/")
async def create_goal(goal_data: Dict[str, Any]):
    """Create a new goal"""
    try:
        goal_id = str(uuid.uuid4())
        goal = {
            "id": goal_id,
            "title": goal_data.get("title", "New Goal"),
            "description": goal_data.get("description", ""),
            "goal_type": goal_data.get("goal_type", "completion"),
            "status": "active",
            "target_value": goal_data.get("target_value", 100),
            "current_value": 0,
            "progress_percentage": 0.0,
            "created_at": datetime.utcnow().isoformat()
        }
        goals_storage[goal_id] = goal
        return goal
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/")
async def list_goals():
    """List all goals"""
    return {
        "goals": list(goals_storage.values()),
        "total": len(goals_storage)
    }

@router.get("/{goal_id}")
async def get_goal(goal_id: str):
    """Get a specific goal"""
    if goal_id not in goals_storage:
        raise HTTPException(status_code=404, detail="Goal not found")
    return goals_storage[goal_id]

@router.put("/{goal_id}/progress")
async def update_progress(goal_id: str, progress_data: Dict[str, Any]):
    """Update goal progress"""
    if goal_id not in goals_storage:
        raise HTTPException(status_code=404, detail="Goal not found")
    
    goal = goals_storage[goal_id]
    new_value = progress_data.get("new_value", goal["current_value"])
    goal["current_value"] = new_value
    goal["progress_percentage"] = (new_value / goal["target_value"]) * 100
    
    if goal["progress_percentage"] >= 100:
        goal["status"] = "completed"
    
    return goal

@router.get("/analytics/dashboard")
async def get_dashboard():
    """Get goals dashboard"""
    total_goals = len(goals_storage)
    completed_goals = len([g for g in goals_storage.values() if g["status"] == "completed"])
    
    return {
        "summary": {
            "total_goals": total_goals,
            "completed_goals": completed_goals,
            "completion_rate": (completed_goals / total_goals * 100) if total_goals > 0 else 0
        },
        "recent_goals": list(goals_storage.values())[:5]
    }

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "module": "goals",
        "status": "✅ Working",
        "goals_count": len(goals_storage),
        "timestamp": datetime.utcnow().isoformat()
    }
