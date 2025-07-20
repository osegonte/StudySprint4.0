# backend/modules/topics/services.py
"""
StudySprint 4.0 - Enhanced Topics Service
Stage 3: Advanced topic management with analytics and hierarchy
"""

from typing import List, Optional, Dict, Any
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from datetime import datetime, timedelta

from common.database import Topic, PDF
from .schemas import TopicCreate, TopicUpdate, TopicResponse, TopicWithStats, TopicList
import logging

logger = logging.getLogger(__name__)


class TopicService:
    """Enhanced service class for topic operations with analytics"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_topic(self, topic_data: TopicCreate) -> TopicResponse:
        """Create a new topic with enhanced initialization"""
        # Check for duplicate names
        existing = self.db.query(Topic).filter(
            and_(
                Topic.name.ilike(topic_data.name),
                Topic.is_archived == False
            )
        ).first()
        
        if existing:
            raise ValueError(f"Topic with name '{topic_data.name}' already exists")
        
        topic = Topic(**topic_data.dict())
        
        # Set creation metadata
        topic.created_at = datetime.utcnow()
        topic.updated_at = datetime.utcnow()
        
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
        """Get topic with comprehensive statistics"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        
        # Calculate comprehensive statistics
        stats = self._calculate_topic_stats(topic_id)
        
        # Create response with stats
        topic_dict = TopicResponse.from_orm(topic).dict()
        topic_dict.update(stats)
        
        return TopicWithStats(**topic_dict)
    
    def list_topics(self, include_archived: bool = False) -> TopicList:
        """List all topics with optional archived filter and enhanced sorting"""
        query = self.db.query(Topic)
        
        if not include_archived:
            query = query.filter(Topic.is_archived == False)
        
        # Enhanced ordering: priority (desc), progress (desc), name (asc)
        topics = query.order_by(
            Topic.priority_level.desc(),
            Topic.study_progress.desc(),
            Topic.name.asc()
        ).all()
        
        # Count archived topics
        archived_count = self.db.query(Topic).filter(Topic.is_archived == True).count()
        
        # Recalculate stats for all topics
        self._batch_update_topic_stats([t.id for t in topics])
        
        return TopicList(
            topics=[TopicResponse.from_orm(topic) for topic in topics],
            total=len(topics),
            archived_count=archived_count
        )
    
    def update_topic(self, topic_id: UUID, topic_update: TopicUpdate) -> Optional[TopicResponse]:
        """Update an existing topic with change tracking"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return None
        
        # Track changes for logging
        changes = []
        update_data = topic_update.dict(exclude_unset=True)
        
        for field, value in update_data.items():
            old_value = getattr(topic, field)
            if old_value != value:
                changes.append(f"{field}: {old_value} → {value}")
                setattr(topic, field, value)
        
        if changes:
            topic.updated_at = datetime.utcnow()
            self.db.commit()
            self.db.refresh(topic)
            
            logger.info(f"Topic updated: {topic.id} - Changes: {', '.join(changes)}")
        
        return TopicResponse.from_orm(topic)
    
    def archive_topic(self, topic_id: UUID) -> bool:
        """Archive a topic with dependency checks"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        # Check for active PDFs
        active_pdfs = self.db.query(PDF).filter(
            and_(
                PDF.topic_id == topic_id,
                PDF.is_completed == False
            )
        ).count()
        
        topic.is_archived = True
        topic.updated_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Topic archived: {topic.id} - {topic.name} (had {active_pdfs} active PDFs)")
        return True
    
    def restore_topic(self, topic_id: UUID) -> bool:
        """Restore an archived topic"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        topic.is_archived = False
        topic.updated_at = datetime.utcnow()
        self.db.commit()
        
        logger.info(f"Topic restored: {topic.id} - {topic.name}")
        return True
    
    def delete_topic(self, topic_id: UUID) -> bool:
        """Permanently delete a topic with cascade cleanup"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return False
        
        # Count associated data before deletion
        pdf_count = self.db.query(PDF).filter(PDF.topic_id == topic_id).count()
        
        try:
            # Delete associated PDFs first (cascade should handle this, but being explicit)
            self.db.query(PDF).filter(PDF.topic_id == topic_id).delete()
            
            # Delete the topic
            self.db.delete(topic)
            self.db.commit()
            
            logger.info(f"Topic deleted: {topic_id} (removed {pdf_count} PDFs)")
            return True
            
        except Exception as e:
            logger.error(f"Error deleting topic {topic_id}: {str(e)}")
            self.db.rollback()
            return False
    
    def get_topic_hierarchy(self) -> List[TopicWithStats]:
        """Get topics organized hierarchically with comprehensive statistics"""
        topics = self.db.query(Topic).filter(Topic.is_archived == False).order_by(
            Topic.priority_level.desc(),
            Topic.study_progress.desc(),
            Topic.name.asc()
        ).all()
        
        result = []
        for topic in topics:
            stats = self._calculate_topic_stats(topic.id)
            topic_dict = TopicResponse.from_orm(topic).dict()
            topic_dict.update(stats)
            result.append(TopicWithStats(**topic_dict))
        
        return result
    
    def search_topics(self, query: str, include_archived: bool = False) -> List[TopicResponse]:
        """Search topics by name and description"""
        db_query = self.db.query(Topic).filter(
            or_(
                Topic.name.ilike(f"%{query}%"),
                Topic.description.ilike(f"%{query}%")
            )
        )
        
        if not include_archived:
            db_query = db_query.filter(Topic.is_archived == False)
        
        topics = db_query.order_by(Topic.priority_level.desc(), Topic.name.asc()).all()
        return [TopicResponse.from_orm(topic) for topic in topics]
    
    def get_topic_analytics(self, topic_id: UUID) -> Dict[str, Any]:
        """Get comprehensive analytics for a topic"""
        topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
        if not topic:
            return {}
        
        # Basic stats
        stats = self._calculate_topic_stats(topic_id)
        
        # Time-based analysis
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)
        
        # Recent activity
        recent_pdfs = self.db.query(PDF).filter(
            and_(
                PDF.topic_id == topic_id,
                PDF.created_at >= week_ago
            )
        ).count()
        
        # Progress trend (could be enhanced with session data)
        progress_trend = "stable"  # Placeholder for now
        
        return {
            **stats,
            "recent_activity": {
                "pdfs_added_last_week": recent_pdfs,
                "progress_trend": progress_trend,
                "last_activity": topic.updated_at.isoformat() if topic.updated_at else None
            },
            "recommendations": self._get_topic_recommendations(topic_id, stats)
        }
    
    def update_topic_progress(self, topic_id: UUID) -> bool:
        """Recalculate and update topic progress based on PDFs"""
        try:
            stats = self._calculate_topic_stats(topic_id)
            
            topic = self.db.query(Topic).filter(Topic.id == topic_id).first()
            if topic:
                topic.total_pdfs = stats["total_pdfs"]
                topic.study_progress = stats["completion_percentage"]
                topic.updated_at = datetime.utcnow()
                self.db.commit()
                
                logger.info(f"Updated progress for topic {topic_id}: {stats['completion_percentage']:.1f}%")
                return True
                
        except Exception as e:
            logger.error(f"Error updating topic progress {topic_id}: {str(e)}")
            self.db.rollback()
            
        return False
    
    # Private helper methods
    
    def _calculate_topic_stats(self, topic_id: UUID) -> Dict[str, Any]:
        """Calculate comprehensive statistics for a topic"""
        # PDF statistics
        pdfs = self.db.query(PDF).filter(PDF.topic_id == topic_id).all()
        
        total_pdfs = len(pdfs)
        completed_pdfs = len([p for p in pdfs if p.is_completed])
        total_pages = sum(p.total_pages for p in pdfs if p.total_pages)
        pages_read = sum(p.current_page for p in pdfs if p.current_page)
        
        # Progress calculation
        completion_percentage = (completed_pdfs / total_pdfs * 100) if total_pdfs > 0 else 0.0
        
        # Reading progress
        reading_percentage = (pages_read / total_pages * 100) if total_pages > 0 else 0.0
        
        # Time estimates
        total_study_time = sum(p.actual_read_time_minutes for p in pdfs if p.actual_read_time_minutes)
        estimated_time = sum(p.estimated_read_time_minutes for p in pdfs if p.estimated_read_time_minutes)
        
        # Find last studied time
        last_studied = None
        if pdfs:
            last_updated = max((p.updated_at for p in pdfs if p.updated_at), default=None)
            last_studied = last_updated
        
        return {
            "total_pdfs": total_pdfs,
            "completed_pdfs": completed_pdfs,
            "total_pages": total_pages,
            "pages_read": pages_read,
            "total_study_time_minutes": total_study_time,
            "estimated_time_minutes": estimated_time,
            "completion_percentage": round(completion_percentage, 2),
            "reading_percentage": round(reading_percentage, 2),
            "last_studied": last_studied
        }
    
    def _batch_update_topic_stats(self, topic_ids: List[UUID]) -> None:
        """Efficiently update statistics for multiple topics"""
        for topic_id in topic_ids:
            try:
                stats = self._calculate_topic_stats(topic_id)
                self.db.query(Topic).filter(Topic.id == topic_id).update({
                    "total_pdfs": stats["total_pdfs"],
                    "study_progress": stats["completion_percentage"],
                    "updated_at": datetime.utcnow()
                })
            except Exception as e:
                logger.error(f"Error updating stats for topic {topic_id}: {str(e)}")
        
        try:
            self.db.commit()
        except Exception as e:
            logger.error(f"Error committing batch stats update: {str(e)}")
            self.db.rollback()
    
    def _get_topic_recommendations(self, topic_id: UUID, stats: Dict[str, Any]) -> List[str]:
        """Generate smart recommendations for a topic"""
        recommendations = []
        
        # Based on completion rate
        if stats["completion_percentage"] == 0:
            recommendations.append("Start by reading your first PDF in this topic")
        elif stats["completion_percentage"] < 25:
            recommendations.append("Focus on completing more PDFs to build momentum")
        elif stats["completion_percentage"] > 75:
            recommendations.append("Great progress! Consider adding exercises or practice materials")
        
        # Based on PDF count
        if stats["total_pdfs"] == 0:
            recommendations.append("Add some study materials to get started")
        elif stats["total_pdfs"] == 1:
            recommendations.append("Consider adding more diverse materials on this topic")
        
        # Based on study time
        if stats["total_study_time_minutes"] == 0:
            recommendations.append("Start your first study session")
        elif stats["total_study_time_minutes"] > 0:
            avg_time_per_pdf = stats["total_study_time_minutes"] / max(stats["total_pdfs"], 1)
            if avg_time_per_pdf < 30:
                recommendations.append("Try longer study sessions for better retention")
        
        return recommendations[:3]  # Return top 3 recommendations
