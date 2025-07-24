# backend/modules/notes/models.py
"""
StudySprint 4.0 - Notes Module Models
Fixed: Proper relationships and imports
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

    # Relationships
    pdf = relationship("PDF", back_populates="notes")
    topic = relationship("Topic", back_populates="notes")
    session = relationship("StudySession", back_populates="notes_created")
    parent_note = relationship("Note", remote_side=[id])
    child_notes = relationship("Note", back_populates="parent_note")
    versions = relationship("NoteVersion", back_populates="note", cascade="all, delete-orphan")
    source_links = relationship("NoteLink", foreign_keys="NoteLink.source_note_id", back_populates="source_note", cascade="all, delete-orphan")
    target_links = relationship("NoteLink", foreign_keys="NoteLink.target_note_id", back_populates="target_note")

    def __repr__(self):
        return f"<Note(id={self.id}, title='{self.title[:30]}...')>"


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

    # Relationships
    source_note = relationship("Note", foreign_keys=[source_note_id], back_populates="source_links")
    target_note = relationship("Note", foreign_keys=[target_note_id], back_populates="target_links")

    def __repr__(self):
        return f"<NoteLink(source={self.source_note_id}, target={self.target_note_id})>"


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

    # Relationships
    pdf = relationship("PDF", back_populates="highlights")
    note = relationship("Note")
    session = relationship("StudySession", back_populates="highlights_made")

    def __repr__(self):
        return f"<Highlight(pdf={self.pdf_id}, page={self.page_number})>"


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

    # Relationships
    pdf = relationship("PDF", back_populates="bookmarks")
    note = relationship("Note")
    session = relationship("StudySession", back_populates="bookmarks_added")

    def __repr__(self):
        return f"<Bookmark(pdf={self.pdf_id}, page={self.page_number}, title='{self.title}')>"


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

    # Relationships
    note = relationship("Note", back_populates="versions")

    def __repr__(self):
        return f"<NoteVersion(note={self.note_id}, version={self.version_number})>"


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

   # Relationships
   outgoing_edges = relationship("KnowledgeEdge", foreign_keys="KnowledgeEdge.source_node_id", back_populates="source_node", cascade="all, delete-orphan")
   incoming_edges = relationship("KnowledgeEdge", foreign_keys="KnowledgeEdge.target_node_id", back_populates="target_node")

   def __repr__(self):
       return f"<KnowledgeNode(type='{self.node_type}', title='{self.title}')>"


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

   # Relationships
   source_node = relationship("KnowledgeNode", foreign_keys=[source_node_id], back_populates="outgoing_edges")
   target_node = relationship("KnowledgeNode", foreign_keys=[target_node_id], back_populates="incoming_edges")

   def __repr__(self):
       return f"<KnowledgeEdge(source={self.source_node_id}, target={self.target_node_id}, type='{self.edge_type}')>"