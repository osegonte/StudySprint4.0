# backend/modules/topics/routes.py - Week 1 Conflict-Free Routes
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from datetime import datetime

from common.database import get_db
from .models import Topic
from .schemas import TopicCreate, TopicResponse

router = APIRouter()

# Use /status instead of /health to avoid conflicts
@router.get("/status")
async def topics_status():
    """Topics module status check"""
    return {
        "module": "topics",
        "status": "✅ Working",
        "stage": "Stage 1", 
        "week": "Week 1"
    }

@router.get("/")
async def list_topics(db: Session = Depends(get_db)):
    """List all topics"""
    try:
        topics = db.query(Topic).filter(Topic.is_archived == False).all()
        result = []
        for topic in topics:
            result.append({
                "id": str(topic.id),
                "name": topic.name,
                "description": topic.description,
                "color": topic.color,
                "icon": topic.icon,
                "total_pdfs": topic.total_pdfs,
                "total_exercises": topic.total_exercises,
                "study_progress": float(topic.study_progress) if topic.study_progress else 0.0,
                "estimated_completion_hours": topic.estimated_completion_hours,
                "difficulty_level": topic.difficulty_level,
                "priority_level": topic.priority_level,
                "is_archived": topic.is_archived,
                "created_at": topic.created_at.isoformat() if topic.created_at else None,
                "updated_at": topic.updated_at.isoformat() if topic.updated_at else None
            })
        return result
    except Exception as e:
        print(f"Error in list_topics: {e}")
        return []

@router.post("/")
async def create_topic(topic_data: TopicCreate, db: Session = Depends(get_db)):
    """Create a new topic"""
    try:
        topic = Topic(**topic_data.dict())
        topic.created_at = datetime.utcnow()
        topic.updated_at = datetime.utcnow()
        
        db.add(topic)
        db.commit()
        db.refresh(topic)
        
        return {
            "id": str(topic.id),
            "name": topic.name,
            "description": topic.description,
            "color": topic.color,
            "icon": topic.icon,
            "total_pdfs": topic.total_pdfs,
            "total_exercises": topic.total_exercises,
            "study_progress": float(topic.study_progress) if topic.study_progress else 0.0,
            "estimated_completion_hours": topic.estimated_completion_hours,
            "difficulty_level": topic.difficulty_level,
            "priority_level": topic.priority_level,
            "is_archived": topic.is_archived,
            "created_at": topic.created_at.isoformat(),
            "updated_at": topic.updated_at.isoformat(),
            "message": "Topic created successfully"
        }
    except Exception as e:
        db.rollback()
        print(f"Error creating topic: {e}")
        raise HTTPException(status_code=400, detail=str(e))

# Specific topic endpoint - keep this last
@router.get("/by-id/{topic_id}")
async def get_topic(topic_id: UUID, db: Session = Depends(get_db)):
    """Get a specific topic by ID"""
    topic = db.query(Topic).filter(Topic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    
    return {
        "id": str(topic.id),
        "name": topic.name,
        "description": topic.description,
        "color": topic.color,
        "icon": topic.icon,
        "total_pdfs": topic.total_pdfs,
        "total_exercises": topic.total_exercises,
        "study_progress": float(topic.study_progress) if topic.study_progress else 0.0,
        "estimated_completion_hours": topic.estimated_completion_hours,
        "difficulty_level": topic.difficulty_level,
        "priority_level": topic.priority_level,
        "is_archived": topic.is_archived,
        "created_at": topic.created_at.isoformat() if topic.created_at else None,
        "updated_at": topic.updated_at.isoformat() if topic.updated_at else None
    }
