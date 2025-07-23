# backend/modules/notes/routes.py
"""
StudySprint 4.0 - Notes API Routes
Basic functionality for Stage 4
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from common.database import get_db
from .services import NotesService, HighlightService
from .schemas import NoteCreate, NoteResponse, HighlightCreate, HighlightResponse

router = APIRouter()

def get_notes_service(db: Session = Depends(get_db)) -> NotesService:
    return NotesService(db)

def get_highlights_service(db: Session = Depends(get_db)) -> HighlightService:
    return HighlightService(db)

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    notes_service: NotesService = Depends(get_notes_service)
):
    """Create a new note"""
    return notes_service.create_note(note_data)

@router.get("/", response_model=List[NoteResponse])
async def list_notes(
    notes_service: NotesService = Depends(get_notes_service)
):
    """List all notes"""
    return notes_service.get_notes()

@router.post("/highlights", response_model=HighlightResponse, status_code=status.HTTP_201_CREATED)
async def create_highlight(
    highlight_data: HighlightCreate,
    highlights_service: HighlightService = Depends(get_highlights_service)
):
    """Create a new highlight"""
    return highlights_service.create_highlight(highlight_data)

@router.get("/status")
async def notes_status():
    """Get notes system status"""
    return {
        "module": "notes",
        "status": "✅ Basic functionality ready",
        "features": {
            "note_creation": "✅ Working",
            "note_listing": "✅ Working", 
            "pdf_highlighting": "✅ Working",
            "database_schema": "✅ Complete"
        }
    }
