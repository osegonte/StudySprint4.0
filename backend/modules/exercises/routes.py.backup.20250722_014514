from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from database import get_db
from .schemas import (
    ExerciseCreate, ExerciseUpdate, ExerciseResponse,
    ExerciseAttemptCreate, ExerciseAttemptResponse,
    ExerciseAnalytics
)
from .services import ExerciseService

router = APIRouter(prefix="/exercises", tags=["exercises"])

@router.post("/", response_model=ExerciseResponse)
def create_exercise(
    exercise: ExerciseCreate,
    db: Session = Depends(get_db)
):
    """Create a new exercise"""
    try:
        service = ExerciseService(db)
        return service.create_exercise(exercise)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    """Get exercise by ID"""
    service = ExerciseService(db)
    exercise = service.get_exercise(exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Exercise not found")
    return exercise

@router.get("/analytics/overview", response_model=ExerciseAnalytics)
def get_exercise_analytics(
    topic_id: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get exercise analytics"""
    service = ExerciseService(db)
    return service.get_exercise_analytics(topic_id)

@router.post("/attempts", response_model=ExerciseAttemptResponse)
def submit_exercise_attempt(
    attempt: ExerciseAttemptCreate,
    db: Session = Depends(get_db)
):
    """Submit exercise attempt"""
    try:
        service = ExerciseService(db)
        return service.submit_attempt(attempt)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
