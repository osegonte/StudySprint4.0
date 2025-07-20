# backend/modules/topics/models.py
"""
StudySprint 4.0 - Topics Module Models
Simplified models that reference the main database models
"""

# Import the actual models from the main database file
from common.database import Topic

# Re-export for convenience
__all__ = ['Topic']


# backend/modules/topics/schemas.py
"""
StudySprint 4.0 - Topics Module Schemas
Pydantic schemas for topic API validation
"""

from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from uuid import UUID


class TopicBase(BaseModel):
    """Base schema for Topic"""
    name: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    color: str = Field("#3498db", regex="^#[0-9A-Fa-f]{6}$")
    icon: str = Field("book", max_length=50)
    difficulty_level: int = Field(1, ge=1, le=5)
    priority_level: int = Field(1, ge=1, le=5)
    
    @validator('name')
    def validate_name(cls, v):
        if not v.strip():
            raise ValueError('Topic name cannot be empty')
        return v.strip()


class TopicCreate(TopicBase):
    """Schema for creating a new topic"""
    pass


class TopicUpdate(BaseModel):
    """Schema for updating topic"""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    color: Optional[str] = Field(None, regex="^#[0-9A-Fa-f]{6}$")
    icon: Optional[str] = Field(None, max_length=50)
    difficulty_level: Optional[int] = Field(None, ge=1, le=5)
    priority_level: Optional[int] = Field(None, ge=1, le=5)
    is_archived: Optional[bool] = None
    
    @validator('name')
    def validate_name(cls, v):
        if v is not None and not v.strip():
            raise ValueError('Topic name cannot be empty')
        return v.strip() if v else v


class TopicResponse(TopicBase):
    """Schema for topic response"""
    id: UUID
    total_pdfs: int = 0
    total_exercises: int = 0
    study_progress: float = 0.0
    estimated_completion_hours: int = 0
    is_archived: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class TopicWithStats(TopicResponse):
    """Schema for topic with detailed statistics"""
    completed_pdfs: int = 0
    total_pages: int = 0
    pages_read: int = 0
    total_study_time_minutes: int = 0
    last_studied: Optional[datetime] = None
    completion_percentage: float = 0.0


class TopicList(BaseModel):
    """Schema for topic list response"""
    topics: List[TopicResponse]
    total: int
    archived_count: int = 0


# backend/modules/topics/services.py
"""
StudySprint 4.0 - Topics Service
Business logic for topic management
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_

from common.database import Topic
from .schemas import TopicCreate, TopicUpdate, TopicResponse, TopicWithStats, TopicList
import logging

logger = logging.getLogger(__name__)


class TopicService:
    """Service class for topic operations"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_topic(self, topic_data: TopicCreate) -> TopicResponse:
        """Create a new topic"""
        topic = Topic(**topic_data.dict())
        
        self.db.add(topic)
        self.db.commit()
        self.db.refresh(topic)
        
        logger.info(f"Topic created: {topic.id} - {topic.name}")
        return TopicResponse.from_orm(topic)
    
    def get_topic(self, topic_id: UUID) -> Optional[TopicResponse]:
        """Get a single topic by ID"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        return TopicResponse.from_orm(topic)
    
    def get_topic_with_stats(self, topic_id: UUID) -> Optional[TopicWithStats]:
        """Get topic with detailed statistics"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        
        # Calculate additional statistics
        # Note: These queries will be implemented when PDF module is integrated
        stats = {
            "completed_pdfs": 0,
            "total_pages": 0,
            "pages_read": 0,
            "total_study_time_minutes": 0,
            "last_studied": None,
            "completion_percentage": float(topic.study_progress)
        }
        
        # Create response with stats
        topic_dict = TopicResponse.from_orm(topic).dict()
        topic_dict.update(stats)
        
        return TopicWithStats(**topic_dict)
    
    def list_topics(self, include_archived: bool = False) -> TopicList:
        """List all topics with optional archived filter"""
        query = self.db.query(Topic)
        
        if not include_archived:
            query = query.filter(Topic.is_archived == False)
        
        # Order by priority level (high to low), then by name
        topics = query.order_by(Topic.priority_level.desc(), Topic.name.asc()).all()
        
        # Count archived topics
        archived_count = self.db.query(Topic).filter(Topic.is_archived == True).count()
        
        return TopicList(
            topics=[TopicResponse.from_orm(topic) for topic in topics],
            total=len(topics),
            archived_count=archived_count
        )
    
    def update_topic(self, topic_id: UUID, topic_update: TopicUpdate) -> Optional[TopicResponse]:
        """Update an existing topic"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        
        # Update fields
        update_data = topic_update.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(topic, field, value)
        
        self.db.commit()
        self.db.refresh(topic)
        
        logger.info(f"Topic updated: {topic.id} - {topic.name}")
        return TopicResponse.from_orm(topic)
    
    def archive_topic(self, topic_id: UUID) -> bool:
        """Archive a topic (soft delete)"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        topic.is_archived = True
        self.db.commit()
        
        logger.info(f"Topic archived: {topic.id} - {topic.name}")
        return True
    
    def restore_topic(self, topic_id: UUID) -> bool:
        """Restore an archived topic"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        topic.is_archived = False
        self.db.commit()
        
        logger.info(f"Topic restored: {topic.id} - {topic.name}")
        return True
    
    def delete_topic(self, topic_id: UUID) -> bool:
        """Permanently delete a topic and all associated data"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        try:
            self.db.delete(topic)
            self.db.commit()
            
            logger.info(f"Topic deleted: {topic_id}")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting topic {topic_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def get_topic_hierarchy(self) -> List[TopicWithStats]:
        """Get topics organized hierarchically with statistics"""
        # For now, return flat list. Can be enhanced for hierarchical structure later
        topics = self.db.query(Topic).filter(Topic.is_archived == False).order_by(
            Topic.priority_level.desc(), Topic.name.asc()
        ).all()
        
        result = []
        for topic in topics:
            stats = {
                "completed_pdfs": 0,
                "total_pages": 0,
                "pages_read": 0,
                "total_study_time_minutes": 0,
                "last_studied": None,
                "completion_percentage": float(topic.study_progress)
            }
            
            topic_dict = TopicResponse.from_orm(topic).dict()
            topic_dict.update(stats)
            result.append(TopicWithStats(**topic_dict))
        
        return result


# backend/modules/topics/routes.py
"""
StudySprint 4.0 - Topics API Routes
FastAPI routes for topic management
"""

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from typing import List, Optional
from uuid import UUID

from common.database import get_db
from .services import TopicService
from .schemas import (
    TopicCreate, TopicUpdate, TopicResponse, TopicWithStats, TopicList
)

router = APIRouter()

# Dependencies
def get_topic_service(db: Session = Depends(get_db)) -> TopicService:
    return TopicService(db)

@router.post("/", response_model=TopicResponse, status_code=status.HTTP_201_CREATED)
async def create_topic(
    topic_data: TopicCreate,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Create a new topic
    
    - **name**: Topic name (required)
    - **description**: Optional topic description
    - **color**: Hex color code (default: #3498db)
    - **icon**: Icon name (default: book)
    - **difficulty_level**: Difficulty rating 1-5 (default: 1)
    - **priority_level**: Priority rating 1-5 (default: 1)
    """
    return topic_service.create_topic(topic_data)

@router.get("/", response_model=TopicList)
async def list_topics(
    include_archived: bool = Query(False, description="Include archived topics"),
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    List all topics
    
    - **include_archived**: Whether to include archived topics
    """
    return topic_service.list_topics(include_archived)

@router.get("/hierarchy", response_model=List[TopicWithStats])
async def get_topic_hierarchy(
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Get topics organized hierarchically with statistics
    """
    return topic_service.get_topic_hierarchy()

@router.get("/{topic_id}", response_model=TopicResponse)
async def get_topic(
    topic_id: UUID,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Get a specific topic by ID
    
    - **topic_id**: UUID of the topic
    """
    topic = topic_service.get_topic(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic

@router.get("/{topic_id}/stats", response_model=TopicWithStats)
async def get_topic_with_stats(
    topic_id: UUID,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Get topic with detailed statistics
    
    - **topic_id**: UUID of the topic
    """
    topic = topic_service.get_topic_with_stats(topic_id)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic

@router.put("/{topic_id}", response_model=TopicResponse)
async def update_topic(
    topic_id: UUID,
    topic_update: TopicUpdate,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Update an existing topic
    
    - **topic_id**: UUID of the topic to update
    - **topic_update**: Fields to update
    """
    topic = topic_service.update_topic(topic_id, topic_update)
    if not topic:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )
    return topic

@router.post("/{topic_id}/archive", status_code=status.HTTP_204_NO_CONTENT)
async def archive_topic(
    topic_id: UUID,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Archive a topic (soft delete)
    
    - **topic_id**: UUID of the topic to archive
    """
    success = topic_service.archive_topic(topic_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

@router.post("/{topic_id}/restore", status_code=status.HTTP_204_NO_CONTENT)
async def restore_topic(
    topic_id: UUID,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Restore an archived topic
    
    - **topic_id**: UUID of the topic to restore
    """
    success = topic_service.restore_topic(topic_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )

@router.delete("/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: UUID,
    topic_service: TopicService = Depends(get_topic_service)
):
    """
    Permanently delete a topic and all associated data
    
    **Warning**: This action cannot be undone!
    
    - **topic_id**: UUID of the topic to delete
    """
    success = topic_service.delete_topic(topic_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Topic not found"
        )