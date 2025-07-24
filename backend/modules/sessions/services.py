# backend/modules/sessions/services.py
"""
StudySprint 4.0 - Enhanced Study Sessions Service Layer
Stage 3 Complete: Business logic for session management, timing, and analytics
"""

from typing import Optional, List, Dict, Any
from uuid import UUID
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func, desc, asc
import logging
import statistics

from modules.pdfs.models import PDF
from modules.topics.models import Topic
from .models import StudySession, PageTime, PomodoroSession, ReadingSpeed, TimeEstimate
from .schemas import (
    StudySessionCreate, StudySessionUpdate, StudySessionEnd, StudySessionResponse,
    PageTimeCreate, PageTimeUpdate, PageTimeEnd, PageTimeResponse,
    PomodoroSessionCreate, PomodoroSessionComplete, PomodoroSessionResponse,
    SessionSearchParams, StudySessionList, SessionAnalytics, SessionType
)

logger = logging.getLogger(__name__)


class StudySessionService:
    """Enhanced service for managing study sessions with advanced timing and analytics"""
    
    def __init__(self, db: Session):
        self.db = db
        self.active_sessions: Dict[str, Dict] = {}  # In-memory active session tracking
    
    def start_session(self, session_data: StudySessionCreate) -> StudySessionResponse:
        """Start a new study session with comprehensive tracking"""
        
        # Check for existing active session
        existing_active = self.db.query(StudySession).filter(
            StudySession.end_time.is_(None)
        ).first()
        
        if existing_active:
            raise ValueError(f"Active session already exists: {existing_active.id}")
        
        # Create new session
        session = StudySession(
            pdf_id=session_data.pdf_id,
            topic_id=session_data.topic_id,
            exercise_id=session_data.exercise_id,
            session_type=session_data.session_type.value if isinstance(session_data.session_type, SessionType) else session_data.session_type,
            session_name=session_data.session_name,
            planned_duration_minutes=session_data.planned_duration_minutes,
            starting_page=session_data.starting_page,
            goals_set=session_data.goals_set,
            environment_type=session_data.environment_type.value if session_data.environment_type else None,
            start_time=datetime.utcnow()
        )
        
        self.db.add(session)
        self.db.commit()
        self.db.refresh(session)
        
        # Initialize active session tracking
        self.active_sessions[str(session.id)] = {
            'start_time': session.start_time,
            'last_activity': datetime.utcnow(),
            'activity_count': 0,
            'idle_periods': [],
            'current_page': session.starting_page
        }
        
        logger.info(f"Started study session: {session.id}")
        return self._to_response(session)
    
    def update_session(self, session_id: UUID, updates: StudySessionUpdate) -> StudySessionResponse:
        """Update session progress with real-time tracking"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        if session.end_time:
            raise ValueError("Cannot update completed session")
        
        # Update session fields
        update_data = updates.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(session, field):
                setattr(session, field, value)
        
        # Update active tracking
        session_key = str(session_id)
        if session_key in self.active_sessions:
            tracking = self.active_sessions[session_key]
            tracking['last_activity'] = datetime.utcnow()
            tracking['activity_count'] += 1
            
            if updates.current_page:
                tracking['current_page'] = updates.current_page
        
        # Calculate real-time metrics
        self._update_session_metrics(session)
        
        self.db.commit()
        self.db.refresh(session)
        
        return self._to_response(session)
    
    def end_session(self, session_id: UUID, end_data: StudySessionEnd) -> StudySessionResponse:
        """End session with final calculations and analytics"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        if session.end_time:
            raise ValueError("Session already ended")
        
        # Apply end data
        if end_data.ending_page:
            session.ending_page = end_data.ending_page
        if end_data.difficulty_rating:
            session.difficulty_rating = end_data.difficulty_rating
        if end_data.energy_level:
            session.energy_level = end_data.energy_level
        if end_data.mood_rating:
            session.mood_rating = end_data.mood_rating
        if end_data.goals_achieved:
            session.goals_achieved = end_data.goals_achieved
        if end_data.notes:
            session.notes = end_data.notes
        
        # Calculate final metrics
        session.end_session()
        
        # Update reading progress if PDF is linked
        if session.pdf_id and session.ending_page:
            self._update_pdf_progress(session.pdf_id, session.ending_page)
        
        # Clean up active tracking
        session_key = str(session_id)
        if session_key in self.active_sessions:
            del self.active_sessions[session_key]
        
        # Generate reading speed record
        self._record_reading_speed(session)
        
        self.db.commit()
        self.db.refresh(session)
        
        logger.info(f"Ended study session: {session_id}, duration: {session.total_minutes}min")
        return self._to_response(session)
    
    def get_active_session(self) -> Optional[StudySessionResponse]:
        """Get currently active session"""
        session = self.db.query(StudySession).filter(
            StudySession.end_time.is_(None)
        ).first()
        
        return self._to_response(session) if session else None
    
    def pause_session(self, session_id: UUID) -> StudySessionResponse:
        """Pause an active session"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        if session.end_time:
            raise ValueError("Cannot pause completed session")
        
        # Mark break start time in session data
        session_data = session.session_data or {}
        session_data['paused_at'] = datetime.utcnow().isoformat()
        session.session_data = session_data
        
        # Update active tracking
        session_key = str(session_id)
        if session_key in self.active_sessions:
            self.active_sessions[session_key]['paused'] = True
            self.active_sessions[session_key]['pause_start'] = datetime.utcnow()
        
        self.db.commit()
        return self._to_response(session)
    
    def resume_session(self, session_id: UUID) -> StudySessionResponse:
        """Resume a paused session"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        if not session:
            raise ValueError(f"Session not found: {session_id}")
        
        # Calculate break time
        session_data = session.session_data or {}
        if 'paused_at' in session_data:
            pause_start = datetime.fromisoformat(session_data['paused_at'])
            break_duration = (datetime.utcnow() - pause_start).total_seconds() / 60
            session.break_minutes += int(break_duration)
            
            # Remove pause marker
            del session_data['paused_at']
            session.session_data = session_data
        
        # Update active tracking
        session_key = str(session_id)
        if session_key in self.active_sessions:
            tracking = self.active_sessions[session_key]
            if tracking.get('paused'):
                tracking['paused'] = False
                if 'pause_start' in tracking:
                    del tracking['pause_start']
                tracking['last_activity'] = datetime.utcnow()
        
        self.db.commit()
        return self._to_response(session)
    
    def get_session(self, session_id: UUID) -> Optional[StudySessionResponse]:
        """Get session by ID"""
        session = self.db.query(StudySession).filter(StudySession.id == session_id).first()
        return self._to_response(session) if session else None
    
    def list_sessions(self, params: SessionSearchParams) -> StudySessionList:
        """List sessions with filtering and pagination"""
        query = self.db.query(StudySession)
        
        # Apply filters
        if params.pdf_id:
            query = query.filter(StudySession.pdf_id == params.pdf_id)
        if params.topic_id:
            query = query.filter(StudySession.topic_id == params.topic_id)
        if params.session_type:
            query = query.filter(StudySession.session_type == params.session_type)
        if params.start_date:
            query = query.filter(StudySession.start_time >= params.start_date)
        if params.end_date:
            query = query.filter(StudySession.start_time <= params.end_date)
        if params.min_duration:
            query = query.filter(StudySession.total_minutes >= params.min_duration)
        if params.max_duration:
            query = query.filter(StudySession.total_minutes <= params.max_duration)
        if params.min_focus_score:
            query = query.filter(StudySession.focus_score >= params.min_focus_score)
        
        # Apply sorting
        sort_column = getattr(StudySession, params.sort_by, StudySession.start_time)
        if params.sort_order == "desc":
            query = query.order_by(desc(sort_column))
        else:
            query = query.order_by(asc(sort_column))
        
        # Get total count
        total = query.count()
        
        # Apply pagination
        offset = (params.page - 1) * params.page_size
        sessions = query.offset(offset).limit(params.page_size).all()
        
        total_pages = (total + params.page_size - 1) // params.page_size
        
        return StudySessionList(
            sessions=[self._to_response(session) for session in sessions],
            total=total,
            page=params.page,
            page_size=params.page_size,
            total_pages=total_pages
        )
    
    def get_session_analytics(self, 
                            start_date: Optional[datetime] = None,
                            end_date: Optional[datetime] = None,
                            topic_id: Optional[UUID] = None) -> SessionAnalytics:
        """Generate comprehensive session analytics"""
        query = self.db.query(StudySession).filter(StudySession.end_time.isnot(None))
        
        # Apply filters
        if start_date:
            query = query.filter(StudySession.start_time >= start_date)
        if end_date:
            query = query.filter(StudySession.start_time <= end_date)
        if topic_id:
            query = query.filter(StudySession.topic_id == topic_id)
        
        sessions = query.all()
        
        if not sessions:
            return SessionAnalytics(
                total_sessions=0,
                total_study_time_minutes=0,
                average_session_duration=0,
                average_focus_score=0,
                average_productivity_score=0,
                total_pages_read=0,
                average_reading_speed_wpm=0,
                total_pomodoro_cycles=0,
                total_xp_earned=0,
                focus_trend=[],
                productivity_trend=[],
                daily_study_minutes=[],
                average_session_rating=0
            )
        
        # Calculate basic metrics
        total_sessions = len(sessions)
        total_study_time = sum(s.total_minutes for s in sessions)
        avg_duration = total_study_time / total_sessions
        avg_focus = statistics.mean([float(s.focus_score) for s in sessions if s.focus_score])
        avg_productivity = statistics.mean([float(s.productivity_score) for s in sessions if s.productivity_score])
        total_pages = sum(s.pages_completed for s in sessions)
        total_pomodoro = sum(s.pomodoro_cycles for s in sessions)
        total_xp = sum(s.xp_earned for s in sessions)
        
        # Calculate reading speed
        reading_speeds = self.db.query(ReadingSpeed).filter(
            ReadingSpeed.session_id.in_([s.id for s in sessions])
        ).all()
        avg_reading_speed = statistics.mean([float(rs.words_per_minute) for rs in reading_speeds if rs.words_per_minute]) if reading_speeds else 0
        
        # Generate trends (last 30 data points)
        recent_sessions = sorted(sessions, key=lambda x: x.start_time)[-30:]
        focus_trend = [float(s.focus_score) for s in recent_sessions if s.focus_score]
        productivity_trend = [float(s.productivity_score) for s in recent_sessions if s.productivity_score]
        
        # Daily study minutes for last 7 days
        daily_minutes = self._calculate_daily_study_minutes(sessions, 7)
        
        # Calculate insights
        best_time = self._find_best_study_time(sessions)
        best_env = self._find_most_productive_environment(sessions)
        
        # Session ratings
        ratings = [s.difficulty_rating for s in sessions if s.difficulty_rating]
        avg_rating = statistics.mean(ratings) if ratings else 0
        
        return SessionAnalytics(
            total_sessions=total_sessions,
            total_study_time_minutes=total_study_time,
            average_session_duration=avg_duration,
            average_focus_score=avg_focus,
            average_productivity_score=avg_productivity,
            total_pages_read=total_pages,
            average_reading_speed_wpm=avg_reading_speed,
            total_pomodoro_cycles=total_pomodoro,
            total_xp_earned=total_xp,
            focus_trend=focus_trend,
            productivity_trend=productivity_trend,
            daily_study_minutes=daily_minutes,
            best_study_time=best_time,
            most_productive_environment=best_env,
            average_session_rating=avg_rating
        )
    
    # Private helper methods
    
    def _to_response(self, session: StudySession) -> StudySessionResponse:
        """Convert session model to response schema"""
        return StudySessionResponse(
            id=session.id,
            pdf_id=session.pdf_id,
            topic_id=session.topic_id,
            exercise_id=session.exercise_id,
            session_type=session.session_type,
            session_name=session.session_name,
            start_time=session.start_time,
            end_time=session.end_time,
            planned_duration_minutes=session.planned_duration_minutes,
            total_minutes=session.total_minutes,
            active_minutes=session.active_minutes,
            idle_minutes=session.idle_minutes,
            break_minutes=session.break_minutes,
            pages_visited=session.pages_visited,
            pages_completed=session.pages_completed,
            starting_page=session.starting_page,
            ending_page=session.ending_page,
            pomodoro_cycles=session.pomodoro_cycles,
            interruptions=session.interruptions,
            focus_score=float(session.focus_score) if session.focus_score else 0.0,
            productivity_score=float(session.productivity_score) if session.productivity_score else 0.0,
            difficulty_rating=session.difficulty_rating,
            energy_level=session.energy_level,
            mood_rating=session.mood_rating,
            environment_type=session.environment_type,
            notes=session.notes,
            goals_set=session.goals_set or [],
            goals_achieved=session.goals_achieved or [],
            xp_earned=session.xp_earned,
            session_data=session.session_data or {},
            created_at=session.created_at,
            is_active=session.is_active,
            duration_seconds=session.duration_seconds,
            efficiency_score=session.efficiency_score
        )
    
    def _update_session_metrics(self, session: StudySession):
        """Update real-time session metrics"""
        session_key = str(session.id)
        if session_key not in self.active_sessions:
            return
        
        tracking = self.active_sessions[session_key]
        now = datetime.utcnow()
        
        # Calculate active vs idle time
        last_activity = tracking.get('last_activity', session.start_time)
        time_since_activity = (now - last_activity).total_seconds()
        
        # Consider idle if no activity for more than 2 minutes
        if time_since_activity > 120:
            idle_seconds = min(time_since_activity, 300)  # Cap at 5 minutes
            session.idle_minutes += int(idle_seconds / 60)
        else:
            session.active_minutes = int((now - session.start_time).total_seconds() / 60) - session.idle_minutes - session.break_minutes
        
        # Update focus score in real-time
        session.focus_score = session.calculate_focus_score()
    
    def _update_pdf_progress(self, pdf_id: UUID, current_page: int):
        """Update PDF reading progress"""
        pdf = self.db.query(PDF).filter(PDF.id == pdf_id).first()
        if pdf:
            pdf.update_reading_progress(current_page)
            self.db.commit()
    
    def _record_reading_speed(self, session: StudySession):
        """Record reading speed data for analytics"""
        if not session.pages_completed or session.active_minutes == 0:
            return
        
        pages_per_minute = session.pages_completed / session.active_minutes
        
        # Estimate words per minute (assume 250 words per page)
        estimated_words = session.pages_completed * 250
        words_per_minute = estimated_words / session.active_minutes
        
        reading_speed = ReadingSpeed(
            pdf_id=session.pdf_id,
            topic_id=session.topic_id,
            session_id=session.id,
            pages_per_minute=pages_per_minute,
            words_per_minute=words_per_minute,
            difficulty_level=session.difficulty_rating,
            time_of_day=session.start_time.hour,
            day_of_week=session.start_time.weekday(),
            week_of_year=session.start_time.isocalendar()[1],
            month=session.start_time.month,
            cognitive_load=session.difficulty_rating
        )
        
        self.db.add(reading_speed)
    
    def _calculate_daily_study_minutes(self, sessions: List[StudySession], days: int) -> List[int]:
        """Calculate daily study minutes for trend analysis"""
        end_date = datetime.utcnow().date()
        start_date = end_date - timedelta(days=days-1)
        
        daily_minutes = []
        for i in range(days):
            current_date = start_date + timedelta(days=i)
            day_sessions = [s for s in sessions if s.start_time.date() == current_date]
            daily_total = sum(s.total_minutes for s in day_sessions)
            daily_minutes.append(daily_total)
        
        return daily_minutes
    
    def _find_best_study_time(self, sessions: List[StudySession]) -> str:
        """Find the most productive time of day"""
        hourly_productivity = {}
        
        for session in sessions:
            if session.productivity_score:
                hour = session.start_time.hour
                if hour not in hourly_productivity:
                    hourly_productivity[hour] = []
                hourly_productivity[hour].append(float(session.productivity_score))
        
        if not hourly_productivity:
            return "Not enough data"
        
        # Find hour with highest average productivity
        best_hour = max(hourly_productivity.items(), 
                       key=lambda x: statistics.mean(x[1]))[0]
        
        if best_hour < 12:
            return f"{best_hour}:00 AM"
        elif best_hour == 12:
            return "12:00 PM"
        else:
            return f"{best_hour-12}:00 PM"
    
    def _find_most_productive_environment(self, sessions: List[StudySession]) -> str:
        """Find the most productive study environment"""
        env_productivity = {}
        
        for session in sessions:
            if session.environment_type and session.productivity_score:
                env = session.environment_type
                if env not in env_productivity:
                    env_productivity[env] = []
                env_productivity[env].append(float(session.productivity_score))
        
        if not env_productivity:
            return "Not enough data"
        
        best_env = max(env_productivity.items(),
                      key=lambda x: statistics.mean(x[1]))[0]
        
        return best_env.replace('_', ' ').title()


class PageTimeService:
    """Service for detailed page-level time tracking"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def start_page_tracking(self, page_data: PageTimeCreate) -> PageTimeResponse:
        """Start tracking time on a specific page"""
        page_time = PageTime(
            session_id=page_data.session_id,
            pdf_id=page_data.pdf_id,
            page_number=page_data.page_number,
            visit_sequence=page_data.visit_sequence,
            words_on_page=page_data.words_on_page,
            start_time=datetime.utcnow()
        )
        
        self.db.add(page_time)
        self.db.commit()
        self.db.refresh(page_time)
        
        return self._to_response(page_time)
    
    def update_page_tracking(self, page_time_id: UUID, updates: PageTimeUpdate) -> PageTimeResponse:
        """Update page tracking with activity data"""
        page_time = self.db.query(PageTime).filter(PageTime.id == page_time_id).first()
        if not page_time:
            raise ValueError(f"Page time record not found: {page_time_id}")
        
        # Update fields
        update_data = updates.dict(exclude_unset=True)
        for field, value in update_data.items():
            if hasattr(page_time, field):
                setattr(page_time, field, value)
        
        self.db.commit()
        self.db.refresh(page_time)
        
        return self._to_response(page_time)
    
    def end_page_tracking(self, page_time_id: UUID, end_data: PageTimeEnd) -> PageTimeResponse:
        """End page tracking and calculate final metrics"""
        page_time = self.db.query(PageTime).filter(PageTime.id == page_time_id).first()
        if not page_time:
            raise ValueError(f"Page time record not found: {page_time_id}")
        
        # Set end time and calculate duration
        page_time.end_time = datetime.utcnow()
        page_time.duration_seconds = int((page_time.end_time - page_time.start_time).total_seconds())
        
        # Apply end data
        if end_data.idle_time_seconds is not None:
            page_time.idle_time_seconds = end_data.idle_time_seconds
            page_time.active_time_seconds = page_time.duration_seconds - page_time.idle_time_seconds
        
        if end_data.activity_count is not None:
            page_time.activity_count = end_data.activity_count
        
        if end_data.difficulty_rating:
            page_time.difficulty_rating = end_data.difficulty_rating
        
        if end_data.comprehension_estimate is not None:
            page_time.comprehension_estimate = end_data.comprehension_estimate
        
        # Calculate reading speed if possible
        page_time.calculate_reading_speed()
        
        self.db.commit()
        self.db.refresh(page_time)
        
        return self._to_response(page_time)
    
    def _to_response(self, page_time: PageTime) -> PageTimeResponse:
        """Convert page time model to response schema"""
        return PageTimeResponse(
            id=page_time.id,
            session_id=page_time.session_id,
            pdf_id=page_time.pdf_id,
            page_number=page_time.page_number,
            visit_sequence=page_time.visit_sequence,
            start_time=page_time.start_time,
            end_time=page_time.end_time,
            duration_seconds=page_time.duration_seconds,
            idle_time_seconds=page_time.idle_time_seconds,
            active_time_seconds=page_time.active_time_seconds,
            activity_count=page_time.activity_count,
            scroll_events=page_time.scroll_events,
            zoom_events=page_time.zoom_events,
            reading_speed_wpm=float(page_time.reading_speed_wpm) if page_time.reading_speed_wpm else None,
            words_on_page=page_time.words_on_page,
            difficulty_rating=page_time.difficulty_rating,
            comprehension_estimate=float(page_time.comprehension_estimate) if page_time.comprehension_estimate else None,
            attention_score=float(page_time.attention_score) if page_time.attention_score else None,
            notes_created=page_time.notes_created,
            highlights_made=page_time.highlights_made,
            bookmarks_added=page_time.bookmarks_added,
            created_at=page_time.created_at
        )


class PomodoroService:
    """Service for Pomodoro technique integration"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def start_pomodoro(self, pomodoro_data: PomodoroSessionCreate) -> PomodoroSessionResponse:
        """Start a new Pomodoro cycle"""
        pomodoro = PomodoroSession(
            study_session_id=pomodoro_data.study_session_id,
            cycle_number=pomodoro_data.cycle_number,
            cycle_type=pomodoro_data.cycle_type.value,
            planned_duration_minutes=pomodoro_data.planned_duration_minutes,
            started_at=datetime.utcnow()
        )
        
        self.db.add(pomodoro)
        self.db.commit()
        self.db.refresh(pomodoro)
        
        return self._to_response(pomodoro)
    
    def complete_pomodoro(self, pomodoro_id: UUID, completion_data: PomodoroSessionComplete) -> PomodoroSessionResponse:
        """Complete a Pomodoro cycle"""
        pomodoro = self.db.query(PomodoroSession).filter(PomodoroSession.id == pomodoro_id).first()
        if not pomodoro:
            raise ValueError(f"Pomodoro session not found: {pomodoro_id}")
        
        # Complete the cycle
        pomodoro.complete_cycle(
            effectiveness_rating=completion_data.effectiveness_rating,
            focus_rating=completion_data.focus_rating
        )
        
        # Apply additional data
        if completion_data.task_completed is not None:
            pomodoro.task_completed = completion_data.task_completed
        if completion_data.interruptions is not None:
            pomodoro.interruptions = completion_data.interruptions
        if completion_data.interruption_types:
            pomodoro.interruption_types = completion_data.interruption_types
        if completion_data.notes:
            pomodoro.notes = completion_data.notes
        
        # Update parent study session
        study_session = self.db.query(StudySession).filter(StudySession.id == pomodoro.study_session_id).first()
        if study_session:
            study_session.pomodoro_cycles += 1
            study_session.xp_earned += pomodoro.xp_earned
        
        self.db.commit()
        self.db.refresh(pomodoro)
        
        return self._to_response(pomodoro)
    
    def _to_response(self, pomodoro: PomodoroSession) -> PomodoroSessionResponse:
        """Convert pomodoro model to response schema"""
        return PomodoroSessionResponse(
            id=pomodoro.id,
            study_session_id=pomodoro.study_session_id,
            cycle_number=pomodoro.cycle_number,
            cycle_type=pomodoro.cycle_type,
            planned_duration_minutes=pomodoro.planned_duration_minutes,
            actual_duration_minutes=pomodoro.actual_duration_minutes,
            completed=pomodoro.completed,
            interruptions=pomodoro.interruptions,
            interruption_types=pomodoro.interruption_types or [],
            effectiveness_rating=pomodoro.effectiveness_rating,
            focus_rating=pomodoro.focus_rating,
            task_completed=pomodoro.task_completed,
            notes=pomodoro.notes,
            xp_earned=pomodoro.xp_earned,
            started_at=pomodoro.started_at,
            completed_at=pomodoro.completed_at,
            is_active=pomodoro.is_active
        )