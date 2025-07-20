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