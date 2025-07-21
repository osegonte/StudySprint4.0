# backend/modules/notes/services.py
"""
StudySprint 4.0 - Notes Module Services
Basic functionality for Stage 4
"""

from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from datetime import datetime

from .models import Note, Highlight
from .schemas import NoteCreate, NoteResponse, HighlightCreate, HighlightResponse


class NotesService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_note(self, note_data: NoteCreate) -> NoteResponse:
        note = Note(
            title=note_data.title,
            content=note_data.content,
            note_type=note_data.note_type.value,
            pdf_id=note_data.pdf_id,
            topic_id=note_data.topic_id
        )
        self.db.add(note)
        self.db.commit()
        self.db.refresh(note)
        return NoteResponse.from_orm(note)
    
    def get_notes(self) -> List[NoteResponse]:
        notes = self.db.query(Note).filter(Note.is_archived == False).all()
        return [NoteResponse.from_orm(note) for note in notes]


class HighlightService:
    def __init__(self, db: Session):
        self.db = db
    
    def create_highlight(self, highlight_data: HighlightCreate) -> HighlightResponse:
        highlight = Highlight(
            pdf_id=highlight_data.pdf_id,
            page_number=highlight_data.page_number,
            selected_text=highlight_data.selected_text,
            color=highlight_data.color
        )
        self.db.add(highlight)
        self.db.commit()
        self.db.refresh(highlight)
        return HighlightResponse.from_orm(highlight)
