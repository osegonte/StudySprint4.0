# backend/modules/analytics/routes.py
from fastapi import APIRouter
from datetime import datetime, timedelta
from typing import Dict, Any

router = APIRouter()

@router.get("/dashboard")
async def get_dashboard():
    """Get analytics dashboard"""
    return {
        "overview": {
            "total_study_time_minutes": 120,
            "total_sessions": 5,
            "avg_focus_score": 78.5,
            "productivity_score": 85.2
        },
        "daily_stats": [
            {
                "date": (datetime.utcnow() - timedelta(days=i)).date().isoformat(),
                "study_minutes": 60 - (i * 5),
                "focus_score": 80 - (i * 2)
            }
            for i in range(7)
        ],
        "insights": [
            "Your focus is highest in the morning",
            "Consider taking more breaks during long sessions",
            "Great consistency this week!"
        ]
    }

@router.get("/real-time")
async def get_real_time():
    """Get real-time metrics"""
    return {
        "active_time_today": 45,
        "focus_score_today": 82.0,
        "pages_read_today": 12,
        "current_streak": 3,
        "productivity_score": 88.5,
        "live_recommendations": [
            "You're doing great! Keep up the momentum",
            "Take a 10-minute break soon",
            "Consider reviewing your notes from yesterday"
        ],
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/summary")
async def get_summary():
    """Get study summary"""
    return {
        "period_start": (datetime.utcnow() - timedelta(days=30)).date().isoformat(),
        "period_end": datetime.utcnow().date().isoformat(),
        "total_study_time_minutes": 1800,
        "total_sessions": 25,
        "avg_focus_score": 79.5,
        "completion_rate": 85.0,
        "trend": "improving"
    }

@router.get("/topics")
async def get_topic_analytics():
    """Get topic analytics"""
    return [
        {
            "topic_name": "Mathematics",
            "study_time_minutes": 600,
            "completion_percentage": 65.0,
            "focus_score": 82.3
        },
        {
            "topic_name": "Physics", 
            "study_time_minutes": 450,
            "completion_percentage": 40.0,
            "focus_score": 76.8
        }
    ]

@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "module": "analytics", 
        "status": "✅ Working",
        "features": ["dashboard", "real-time", "insights"],
        "timestamp": datetime.utcnow().isoformat()
    }
