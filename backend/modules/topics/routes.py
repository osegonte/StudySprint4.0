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