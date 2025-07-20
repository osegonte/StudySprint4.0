from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel

from common.database import get_db
from .models import StudySession

router = APIRouter()

class StudySessionCreate(BaseModel):
    session_type: str = 'study'
    planned_duration_minutes: int = 60
    starting_page: int = 1
    goals_set: List[str] = []
    environment_type: Optional[str] = 'home'

class StudySessionEnd(BaseModel):
    ending_page: Optional[int] = None
    notes: Optional[str] = None

class StudySessionService:
    def __init__(self, db: Session):
        self.db = db
    
    def get_active_session(self):
        return self.db.query(StudySession).filter(StudySession.end_time.is_(None)).first()
    
    def start_session(self, session_data):
        existing = self.get_active_session()
        if existing:
            raise ValueError("Active session already exists")
        
        session = StudySession(
            session_type=session_data.session_type,
            planned_duration_minutes=session_data.planned_duration_minutes,
            starting_page=session_data.starting_page,
            goals_set=session_data.goals_set,
            environment_type=session_data.environment_type,
            start_time=datetime.utcnow()
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        return session
    
    def end_session(self, session_id: UUID, end_data):
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            raise ValueError("Session not found")
        
        session.end_time = datetime.utcnow()
        session.total_minutes = int((session.end_time - session.start_time).total_seconds() / 60)
        
        if hasattr(end_data, 'ending_page') and end_data.ending_page:
            session.ending_page = end_data.ending_page
        if hasattr(end_data, 'notes') and end_data.notes:
            session.notes = end_data.notes
        
        self.db.commit()
        self.db.refresh(session)
        return session

def get_session_service(db: Session = Depends(get_db)):
    return StudySessionService(db)

@router.get("/placeholder")
async def sessions_placeholder():
    return {"message": "Sessions module working!", "status": "active"}

@router.post("/start")
async def start_study_session(session_data: StudySessionCreate, session_service: StudySessionService = Depends(get_session_service)):
    try:
        session = session_service.start_session(session_data)
        return {"id": str(session.id), "message": "Session started!", "session_type": session.session_type, "start_time": session.start_time.isoformat()}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/current")
async def get_current_session(session_service: StudySessionService = Depends(get_session_service)):
    session = session_service.get_active_session()
    if not session:
        return {"message": "No active session"}
    return {"id": str(session.id), "session_type": session.session_type, "start_time": session.start_time.isoformat(), "planned_duration_minutes": session.planned_duration_minutes, "is_active": True}

@router.post("/{session_id}/end")
async def end_study_session(session_id: UUID, end_data: StudySessionEnd, session_service: StudySessionService = Depends(get_session_service)):
    try:
        session = session_service.end_session(session_id, end_data)
        return {"id": str(session.id), "message": "Session ended!", "total_minutes": session.total_minutes, "end_time": session.end_time.isoformat()}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
