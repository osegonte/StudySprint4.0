# backend/modules/sessions/routes.py
"""
StudySprint 4.0 - Complete Study Sessions Routes
Stage 3 Final: Advanced session management with real-time features
"""

from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
import logging
import json

from common.database import get_db
from .models import StudySession, PageTime, PomodoroSession
from .services import StudySessionService, PageTimeService, PomodoroService
from .schemas import (
    StudySessionCreate, StudySessionUpdate, StudySessionEnd, StudySessionResponse,
    PageTimeCreate, PageTimeUpdate, PageTimeEnd, PageTimeResponse,
    PomodoroSessionCreate, PomodoroSessionComplete, PomodoroSessionResponse,
    SessionSearchParams, StudySessionList, SessionAnalytics, TimerState
)
from .timer import session_timer

logger = logging.getLogger(__name__)
router = APIRouter()

# Dependencies
def get_session_service(db: Session = Depends(get_db)) -> StudySessionService:
    return StudySessionService(db)

def get_page_time_service(db: Session = Depends(get_db)) -> PageTimeService:
    return PageTimeService(db)

def get_pomodoro_service(db: Session = Depends(get_db)) -> PomodoroService:
    return PomodoroService(db)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"WebSocket connected for session {session_id}")
    
    def disconnect(self, session_id: str):
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"WebSocket disconnected for session {session_id}")
    
    async def send_timer_update(self, session_id: str, data: dict):
        if session_id in self.active_connections:
            try:
                await self.active_connections[session_id].send_text(json.dumps(data))
            except Exception as e:
                logger.error(f"Error sending timer update to {session_id}: {str(e)}")
                self.disconnect(session_id)

manager = ConnectionManager()

# =============================================================================
# CORE SESSION MANAGEMENT ENDPOINTS
# =============================================================================

@router.post("/start", response_model=StudySessionResponse, status_code=status.HTTP_201_CREATED)
async def start_study_session(
    session_data: StudySessionCreate,
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Start a new study session with comprehensive tracking
    
    Features:
    - Conflict detection for active sessions
    - Initial timer setup
    - Goal setting and planning
    - Environment tracking
    """
    try:
        # Start the session
        session = session_service.start_session(session_data)
        
        # Initialize the real-time timer
        await session_timer.start_timer(
            session.id, 
            session_data.planned_duration_minutes
        )
        
        logger.info(f"Study session started: {session.id}")
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        logger.error(f"Error starting session: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start study session"
        )

@router.get("/current", response_model=Optional[StudySessionResponse])
async def get_current_session(
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Get the currently active study session
    
    Returns detailed session information including:
    - Real-time progress metrics
    - Current timer state
    - Focus and productivity scores
    """
    return session_service.get_active_session()

@router.put("/{session_id}", response_model=StudySessionResponse)
async def update_session(
    session_id: UUID,
    updates: StudySessionUpdate,
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Update session progress with real-time tracking
    
    Features:
    - Page progress updates
    - Goal achievement tracking
    - Real-time metrics calculation
    - Activity logging
    """
    try:
        session = session_service.update_session(session_id, updates)
        
        # Register activity for focus tracking
        await session_timer.register_activity(session_id, "session_update")
        
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{session_id}/pause", response_model=StudySessionResponse)
async def pause_session(
    session_id: UUID,
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Pause an active study session
    
    Features:
    - Timer pause with break time tracking
    - Activity state preservation
    - Focus score maintenance
    """
    try:
        session = session_service.pause_session(session_id)
        await session_timer.pause_timer(session_id)
        
        logger.info(f"Session paused: {session_id}")
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{session_id}/resume", response_model=StudySessionResponse)
async def resume_session(
    session_id: UUID,
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Resume a paused study session
    
    Features:
    - Break time calculation
    - Timer state restoration
    - Activity tracking resumption
    """
    try:
        session = session_service.resume_session(session_id)
        await session_timer.resume_timer(session_id)
        
        logger.info(f"Session resumed: {session_id}")
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/{session_id}/end", response_model=StudySessionResponse)
async def end_study_session(
    session_id: UUID,
    end_data: StudySessionEnd,
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    End a study session with comprehensive finalization
    
    Features:
    - Final metrics calculation
    - XP and achievement processing
    - Reading progress updates
    - Session analytics generation
    """
    try:
        # Get final timer statistics
        timer_stats = await session_timer.stop_timer(session_id)
        
        # End the session with final data
        session = session_service.end_session(session_id, end_data)
        
        logger.info(f"Session ended: {session_id}, stats: {timer_stats}")
        return session
        
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# =============================================================================
# SESSION LISTING AND SEARCH
# =============================================================================

@router.get("/", response_model=StudySessionList)
async def list_sessions(
    pdf_id: Optional[UUID] = Query(None),
    topic_id: Optional[UUID] = Query(None),
    session_type: Optional[str] = Query(None),
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    min_duration: Optional[int] = Query(None, ge=1),
    min_focus_score: Optional[float] = Query(None, ge=0.0, le=100.0),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    sort_by: str = Query("start_time"),
    sort_order: str = Query("desc"),
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    List study sessions with advanced filtering and pagination
    
    Filters:
    - PDF/Topic association
    - Session type and duration
    - Date ranges
    - Performance metrics
    """
    search_params = SessionSearchParams(
        pdf_id=pdf_id,
        topic_id=topic_id,
        session_type=session_type,
        start_date=start_date,
        end_date=end_date,
        min_duration=min_duration,
        min_focus_score=min_focus_score,
        page=page,
        page_size=page_size,
        sort_by=sort_by,
        sort_order=sort_order
    )
    
    return session_service.list_sessions(search_params)

@router.get("/{session_id}", response_model=StudySessionResponse)
async def get_session(
    session_id: UUID,
    session_service: StudySessionService = Depends(get_session_service)
):
    """Get detailed information about a specific session"""
    session = session_service.get_session(session_id)
    if not session:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    return session

# =============================================================================
# ANALYTICS AND INSIGHTS
# =============================================================================

@router.get("/analytics/overview", response_model=SessionAnalytics)
async def get_session_analytics(
    start_date: Optional[datetime] = Query(None),
    end_date: Optional[datetime] = Query(None),
    topic_id: Optional[UUID] = Query(None),
    session_service: StudySessionService = Depends(get_session_service)
):
    """
    Get comprehensive session analytics and insights
    
    Features:
    - Performance trends
    - Focus and productivity metrics
    - Time distribution analysis
    - Personalized recommendations
    """
    return session_service.get_session_analytics(start_date, end_date, topic_id)

@router.get("/analytics/daily")
async def get_daily_analytics(
    days: int = Query(30, ge=1, le=365),
    session_service: StudySessionService = Depends(get_session_service)
):
    """Get daily study analytics for the specified number of days"""
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)
    
    analytics = session_service.get_session_analytics(start_date, end_date)
    
    return {
        "period": f"Last {days} days",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat(),
        "analytics": analytics
    }

# =============================================================================
# PAGE-LEVEL TIME TRACKING
# =============================================================================

@router.post("/page-tracking/start", response_model=PageTimeResponse)
async def start_page_tracking(
    page_data: PageTimeCreate,
    page_service: PageTimeService = Depends(get_page_time_service)
):
    """
    Start tracking time on a specific PDF page
    
    Features:
    - Precise page-level timing
    - Reading speed calculation setup
    - Activity monitoring initialization
    """
    try:
        return page_service.start_page_tracking(page_data)
    except Exception as e:
        logger.error(f"Error starting page tracking: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start page tracking"
        )

@router.put("/page-tracking/{page_time_id}", response_model=PageTimeResponse)
async def update_page_tracking(
    page_time_id: UUID,
    updates: PageTimeUpdate,
    page_service: PageTimeService = Depends(get_page_time_service)
):
    """
    Update page tracking with activity data
    
    Features:
    - Scroll and zoom event logging
    - Note and highlight tracking
    - Real-time comprehension assessment
    """
    try:
        return page_service.update_page_tracking(page_time_id, updates)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

@router.post("/page-tracking/{page_time_id}/end", response_model=PageTimeResponse)
async def end_page_tracking(
    page_time_id: UUID,
    end_data: PageTimeEnd,
    page_service: PageTimeService = Depends(get_page_time_service)
):
    """
    End page tracking and calculate final metrics
    
    Features:
    - Reading speed calculation
    - Comprehension scoring
    - Attention metric generation
    """
    try:
        return page_service.end_page_tracking(page_time_id, end_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# =============================================================================
# POMODORO INTEGRATION
# =============================================================================

@router.post("/pomodoro/start", response_model=PomodoroSessionResponse)
async def start_pomodoro(
    pomodoro_data: PomodoroSessionCreate,
    pomodoro_service: PomodoroService = Depends(get_pomodoro_service)
):
    """
    Start a new Pomodoro cycle
    
    Features:
    - Work/break cycle management
    - Integration with main study session
    - Effectiveness tracking setup
    """
    try:
        return pomodoro_service.start_pomodoro(pomodoro_data)
    except Exception as e:
        logger.error(f"Error starting Pomodoro: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to start Pomodoro cycle"
        )

@router.post("/pomodoro/{pomodoro_id}/complete", response_model=PomodoroSessionResponse)
async def complete_pomodoro(
    pomodoro_id: UUID,
    completion_data: PomodoroSessionComplete,
    pomodoro_service: PomodoroService = Depends(get_pomodoro_service)
):
    """
    Complete a Pomodoro cycle with effectiveness rating
    
    Features:
    - Cycle completion tracking
    - Effectiveness and focus rating
    - XP calculation and rewards
    - Parent session updates
    """
    try:
        return pomodoro_service.complete_pomodoro(pomodoro_id, completion_data)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

# =============================================================================
# REAL-TIME TIMER AND ACTIVITY TRACKING
# =============================================================================

@router.post("/{session_id}/activity")
async def register_activity(
    session_id: UUID,
    activity_type: str = "interaction"
):
    """
    Register user activity for focus scoring
    
    Activity types:
    - interaction: Mouse/keyboard activity
    - page_change: Navigation events
    - note_taking: Content creation
    - highlighting: Content marking
    """
    success = await session_timer.register_activity(session_id, activity_type)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found or not active"
        )
    
    return {"status": "activity_registered", "type": activity_type}

@router.post("/{session_id}/interruption")
async def register_interruption(
    session_id: UUID,
    interruption_type: str = "unknown"
):
    """
    Register an interruption event
    
    Interruption types:
    - notification: System notifications
    - phone_call: Phone interruptions
    - break: Intentional breaks
    - distraction: Unplanned distractions
    """
    success = await session_timer.register_interruption(session_id, interruption_type)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Session not found"
        )
    
    return {"status": "interruption_registered", "type": interruption_type}

@router.get("/{session_id}/timer-state")
async def get_timer_state(session_id: UUID):
    """
    Get real-time timer state for a session
    
    Returns:
    - Current elapsed time
    - Activity metrics
    - Focus score
    - Idle detection status
    """
    state = await session_timer.get_timer_state(session_id)
    if not state:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Timer not found for session"
        )
    
    return state

# =============================================================================
# WEBSOCKET REAL-TIME TIMER
# =============================================================================

@router.websocket("/{session_id}/timer")
async def websocket_timer(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time timer updates
    
    Features:
    - Live timer updates every second
    - Activity status monitoring
    - Focus score changes
    - Pomodoro cycle notifications
    """
    await manager.connect(websocket, session_id)
    
    try:
        while True:
            # Get current timer state
            state = await session_timer.get_timer_state(UUID(session_id))
            
            if state:
                # Send timer update to client
                await manager.send_timer_update(session_id, {
                    "type": "timer_update",
                    "session_id": session_id,
                    "timestamp": datetime.utcnow().isoformat(),
                    "state": state
                })
            
            # Wait for next update or incoming message
            try:
                # Check for incoming messages (activity tracking)
                message = await websocket.receive_text()
                data = json.loads(message)
                
                if data.get("type") == "activity":
                    await session_timer.register_activity(
                        UUID(session_id), 
                        data.get("activity_type", "interaction")
                    )
                elif data.get("type") == "interruption":
                    await session_timer.register_interruption(
                        UUID(session_id),
                        data.get("interruption_type", "unknown")
                    )
                    
            except Exception:
                # No message received, continue with timer updates
                import asyncio
                await asyncio.sleep(1)
                
    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"WebSocket disconnected for session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {str(e)}")
        manager.disconnect(session_id)

# =============================================================================
# HEALTH AND STATUS ENDPOINTS
# =============================================================================

@router.get("/health")
async def session_health_check():
    """
    Check the health of session services
    
    Returns:
    - Timer service status
    - Active session count
    - WebSocket connection count
    - Service availability
    """
    active_sessions = len(session_timer.active_timers)
    websocket_connections = len(manager.active_connections)
    
    return {
        "status": "healthy",
        "timer_service": "online" if session_timer.is_running else "offline",
        "active_sessions": active_sessions,
        "websocket_connections": websocket_connections,
        "features": {
            "real_time_tracking": True,
            "focus_scoring": True,
            "pomodoro_integration": True,
            "page_level_timing": True,
            "activity_detection": True,
            "analytics_generation": True
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/status")
async def session_status():
    """Get detailed session system status"""
    return {
        "module": "sessions",
        "version": "1.0.0",
        "stage": "Stage 3 Complete",
        "features": {
            "session_management": "✅ Complete",
            "real_time_timer": "✅ Complete", 
            "focus_scoring": "✅ Complete",
            "activity_tracking": "✅ Complete",
            "pomodoro_integration": "✅ Complete",
            "page_level_timing": "✅ Complete",
            "session_analytics": "✅ Complete",
            "websocket_support": "✅ Complete"
        },
        "endpoints": {
            "core_session": 6,
            "analytics": 2,
            "page_tracking": 3,
            "pomodoro": 2,
            "real_time": 3,
            "websocket": 1,
            "utility": 2,
            "total": 19
        },
        "timestamp": datetime.utcnow().isoformat()
    }