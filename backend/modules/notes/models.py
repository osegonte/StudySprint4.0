# backend/modules/notes/models.py
"""
StudySprint 4.0 - Notes Module Models
Fixed: renamed metadata to note_metadata to avoid SQLAlchemy conflict
"""

from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey, DECIMAL
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
import re
from typing import List, Dict, Any
from common.database import Base


class Note(Base):
    __tablename__ = "notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    content = Column(Text)
    content_type = Column(String(20), default='markdown')
    
    # Associations
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"))
    topic_id = Column(UUID(as_uuid=True), ForeignKey("topics.id", ondelete="CASCADE"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    parent_note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"))
    highlight_id = Column(UUID(as_uuid=True), ForeignKey("highlights.id"))
    
    # Note classification
    note_type = Column(String(30), default='general')
    page_number = Column(Integer)
    
    # Status and visibility
    is_template = Column(Boolean, default=False)
    is_public = Column(Boolean, default=False)
    is_archived = Column(Boolean, default=False)
    
    # Analytics
    word_count = Column(Integer, default=0)
    reading_time_minutes = Column(Integer, default=0)
    linked_notes_count = Column(Integer, default=0)
    backlinks_count = Column(Integer, default=0)
    importance_score = Column(DECIMAL(3,2), default=0.0)
    
    # Metadata - renamed to avoid SQLAlchemy conflict
    tags = Column(ARRAY(String))
    note_metadata = Column(JSON, default={})
    
    # Versioning
    version = Column(Integer, default=1)
    last_version_id = Column(UUID(as_uuid=True), ForeignKey("note_versions.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NoteLink(Base):
    __tablename__ = "note_links"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id", ondelete="CASCADE"))
    target_note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id", ondelete="CASCADE"))
    
    # Link metadata
    link_type = Column(String(20), default='direct')
    link_text = Column(String(500))
    context_before = Column(String(200))
    context_after = Column(String(200))
    anchor_position = Column(Integer)
    
    # Analytics
    strength_score = Column(DECIMAL(3,2), default=1.0)
    is_automatic = Column(Boolean, default=False)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Highlight(Base):
    __tablename__ = "highlights"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"))
    page_number = Column(Integer, nullable=False)
    
    # Highlight properties
    highlight_type = Column(String(20), default='text')
    color = Column(String(7), default='#ffff00')
    
    # Content
    selected_text = Column(Text)
    surrounding_text = Column(Text)
    annotation_text = Column(Text)
    
    # Coordinate data
    coordinates = Column(JSON)
    bounding_boxes = Column(JSON)
    
    # Associations
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    
    # Analytics
    importance_level = Column(Integer, default=1)
    confidence_score = Column(DECIMAL(3,2), default=1.0)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Bookmark(Base):
    __tablename__ = "bookmarks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pdf_id = Column(UUID(as_uuid=True), ForeignKey("pdfs.id", ondelete="CASCADE"))
    page_number = Column(Integer, nullable=False)
    
    # Bookmark properties
    title = Column(String(255), nullable=False)
    description = Column(Text)
    bookmark_type = Column(String(20), default='general')
    color = Column(String(7), default='#0066cc')
    position_y = Column(Float)
    
    # Associations
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id"))
    session_id = Column(UUID(as_uuid=True), ForeignKey("study_sessions.id"))
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class NoteVersion(Base):
    __tablename__ = "note_versions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    note_id = Column(UUID(as_uuid=True), ForeignKey("notes.id", ondelete="CASCADE"))
    version_number = Column(Integer, nullable=False)
    
    # Version content
    title = Column(String(255), nullable=False)
    content = Column(Text)
    change_summary = Column(String(500))
    word_count = Column(Integer, default=0)
    
    # Timestamp
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeNode(Base):
    __tablename__ = "knowledge_nodes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    node_type = Column(String(20), nullable=False)
    entity_id = Column(UUID(as_uuid=True), nullable=False)
    title = Column(String(255), nullable=False)
    
    # Graph metrics
    centrality_score = Column(DECIMAL(5,4), default=0.0)
    betweenness_score = Column(DECIMAL(5,4), default=0.0)
    clustering_coefficient = Column(DECIMAL(5,4), default=0.0)
    degree = Column(Integer, default=0)
    community_id = Column(String(50))
    importance_rank = Column(Integer)
    
    # Metadata
    last_calculated = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)


class KnowledgeEdge(Base):
    __tablename__ = "knowledge_edges"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"))
    target_node_id = Column(UUID(as_uuid=True), ForeignKey("knowledge_nodes.id", ondelete="CASCADE"))
    
    # Edge properties
    edge_type = Column(String(30), nullable=False)
    weight = Column(DECIMAL(5,4), default=1.0)
    strength = Column(DECIMAL(3,2), default=1.0)
    context = Column(Text)
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
