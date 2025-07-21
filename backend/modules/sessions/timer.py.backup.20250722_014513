# backend/modules/sessions/timer.py
"""
StudySprint 4.0 - Real-time Timer Service
Advanced timer with activity detection and focus scoring
"""

import asyncio
import time
from datetime import datetime, timedelta
from typing import Dict, Optional, Callable
from uuid import UUID
import logging

logger = logging.getLogger(__name__)


class SessionTimer:
    """Real-time session timer with activity tracking"""
    
    def __init__(self):
        self.active_timers: Dict[str, Dict] = {}
        self.activity_callbacks: Dict[str, Callable] = {}
        self.is_running = False
        
    async def start_timer(self, session_id: UUID, planned_duration_minutes: int = 60) -> bool:
        """Start a new session timer"""
        session_key = str(session_id)
        
        if session_key in self.active_timers:
            return False  # Timer already running
        
        self.active_timers[session_key] = {
            'session_id': session_id,
            'start_time': datetime.utcnow(),
            'planned_duration': planned_duration_minutes * 60,  # Convert to seconds
            'elapsed_seconds': 0,
            'active_seconds': 0,
            'idle_seconds': 0,
            'break_seconds': 0,
            'last_activity': datetime.utcnow(),
            'activity_count': 0,
            'interruptions': 0,
            'focus_events': [],
            'idle_events': [],
            'is_paused': False,
            'pause_start': None,
            'pomodoro_cycles': 0,
            'current_pomodoro': None
        }
        
        logger.info(f"Timer started for session {session_id}")
        return True
    
    async def pause_timer(self, session_id: UUID) -> bool:
        """Pause an active timer"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return False
        
        timer = self.active_timers[session_key]
        if timer['is_paused']:
            return False
        
        timer['is_paused'] = True
        timer['pause_start'] = datetime.utcnow()
        
        logger.info(f"Timer paused for session {session_id}")
        return True
    
    async def resume_timer(self, session_id: UUID) -> bool:
        """Resume a paused timer"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return False
        
        timer = self.active_timers[session_key]
        if not timer['is_paused']:
            return False
        
        # Calculate break time
        if timer['pause_start']:
            break_duration = (datetime.utcnow() - timer['pause_start']).total_seconds()
            timer['break_seconds'] += break_duration
        
        timer['is_paused'] = False
        timer['pause_start'] = None
        timer['last_activity'] = datetime.utcnow()
        
        logger.info(f"Timer resumed for session {session_id}")
        return True
    
    async def stop_timer(self, session_id: UUID) -> Optional[Dict]:
        """Stop and return final timer statistics"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return None
        
        timer = self.active_timers[session_key]
        
        # Calculate final metrics
        end_time = datetime.utcnow()
        total_duration = (end_time - timer['start_time']).total_seconds()
        
        # Handle paused state
        if timer['is_paused'] and timer['pause_start']:
            break_duration = (end_time - timer['pause_start']).total_seconds()
            timer['break_seconds'] += break_duration
        
        final_stats = {
            'session_id': timer['session_id'],
            'total_minutes': int(total_duration / 60),
            'active_minutes': int(timer['active_seconds'] / 60),
            'idle_minutes': int(timer['idle_seconds'] / 60),
            'break_minutes': int(timer['break_seconds'] / 60),
            'activity_count': timer['activity_count'],
            'interruptions': timer['interruptions'],
            'focus_score': self._calculate_focus_score(timer),
            'productivity_score': self._calculate_productivity_score(timer),
            'pomodoro_cycles': timer['pomodoro_cycles'],
            'efficiency_percentage': self._calculate_efficiency(timer)
        }
        
        # Remove from active timers
        del self.active_timers[session_key]
        
        logger.info(f"Timer stopped for session {session_id}, final stats: {final_stats}")
        return final_stats
    
    async def register_activity(self, session_id: UUID, activity_type: str = 'interaction') -> bool:
        """Register user activity for focus tracking"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return False
        
        timer = self.active_timers[session_key]
        
        if timer['is_paused']:
            return False
        
        now = datetime.utcnow()
        timer['last_activity'] = now
        timer['activity_count'] += 1
        
        # Track focus events
        timer['focus_events'].append({
            'timestamp': now,
            'type': activity_type
        })
        
        # Clean old events (keep last hour)
        cutoff = now - timedelta(hours=1)
        timer['focus_events'] = [
            event for event in timer['focus_events'] 
            if event['timestamp'] > cutoff
        ]
        
        return True
    
    async def register_interruption(self, session_id: UUID, interruption_type: str = 'unknown') -> bool:
        """Register an interruption event"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return False
        
        timer = self.active_timers[session_key]
        timer['interruptions'] += 1
        
        timer['idle_events'].append({
            'timestamp': datetime.utcnow(),
            'type': interruption_type
        })
        
        logger.info(f"Interruption registered for session {session_id}: {interruption_type}")
        return True
    
    async def get_timer_state(self, session_id: UUID) -> Optional[Dict]:
        """Get current timer state"""
        session_key = str(session_id)
        
        if session_key not in self.active_timers:
            return None
        
        timer = self.active_timers[session_key]
        now = datetime.utcnow()
        
        # Calculate current elapsed time
        if timer['is_paused']:
            elapsed = (timer['pause_start'] - timer['start_time']).total_seconds()
        else:
            elapsed = (now - timer['start_time']).total_seconds()
            elapsed -= timer['break_seconds']  # Subtract break time
        
        # Check for idle time
        time_since_activity = (now - timer['last_activity']).total_seconds()
        is_idle = time_since_activity > 120  # 2 minutes of inactivity
        
        if is_idle and not timer['is_paused']:
            idle_time = min(time_since_activity, 300)  # Cap at 5 minutes
            timer['idle_seconds'] += idle_time
        else:
            active_time = elapsed - timer['idle_seconds'] - timer['break_seconds']
            timer['active_seconds'] = max(0, active_time)
        
        return {
            'session_id': timer['session_id'],
            'is_active': not timer['is_paused'],
            'elapsed_seconds': int(elapsed),
            'active_seconds': int(timer['active_seconds']),
            'idle_seconds': int(timer['idle_seconds']),
            'break_seconds': int(timer['break_seconds']),
            'planned_duration': timer['planned_duration'],
            'progress_percentage': min(100, (elapsed / timer['planned_duration']) * 100),
            'activity_count': timer['activity_count'],
            'interruptions': timer['interruptions'],
            'focus_score': self._calculate_focus_score(timer),
            'is_idle': is_idle,
            'time_since_activity': time_since_activity,
            'pomodoro_cycles': timer['pomodoro_cycles']
        }
    
    def _calculate_focus_score(self, timer: Dict) -> float:
        """Calculate focus score based on activity patterns"""
        if timer['active_seconds'] == 0:
            return 0.0
        
        total_time = timer['active_seconds'] + timer['idle_seconds']
        if total_time == 0:
            return 0.0
        
        # Base score from active ratio
        active_ratio = timer['active_seconds'] / total_time
        
        # Penalty for interruptions
        interruption_penalty = min(timer['interruptions'] * 0.1, 0.5)
        
        # Bonus for consistent activity (fewer idle periods)
        consistency_bonus = 0.0
        if len(timer['idle_events']) > 0:
            avg_idle_gap = total_time / len(timer['idle_events'])
            if avg_idle_gap > 300:  # Long periods between idle events
                consistency_bonus = 0.1
        
        focus_score = (active_ratio - interruption_penalty + consistency_bonus) * 100
        return max(0.0, min(100.0, focus_score))
    
    def _calculate_productivity_score(self, timer: Dict) -> float:
        """Calculate productivity score based on activity and focus"""
        focus_score = self._calculate_focus_score(timer)
        
        # Activity frequency score
        if timer['active_seconds'] > 0:
            activity_rate = timer['activity_count'] / (timer['active_seconds'] / 60)  # Activities per minute
            activity_score = min(100, activity_rate * 10)  # Scale activity rate
        else:
            activity_score = 0
        
        # Combine focus and activity scores
        productivity_score = (focus_score * 0.7) + (activity_score * 0.3)
        return max(0.0, min(100.0, productivity_score))
    
    def _calculate_efficiency(self, timer: Dict) -> float:
        """Calculate overall efficiency percentage"""
        total_time = timer['active_seconds'] + timer['idle_seconds'] + timer['break_seconds']
        if total_time == 0:
            return 0.0
        
        return (timer['active_seconds'] / total_time) * 100
    
    async def start_background_updates(self):
        """Start background task for timer updates"""
        self.is_running = True
        
        while self.is_running:
            try:
                # Update all active timers
                for session_key in list(self.active_timers.keys()):
                    await self.get_timer_state(UUID(session_key))
                
                # Sleep for 1 second
                await asyncio.sleep(1)
                
            except Exception as e:
                logger.error(f"Error in background timer updates: {str(e)}")
                await asyncio.sleep(5)  # Wait longer on error
    
    async def stop_background_updates(self):
        """Stop background timer updates"""
        self.is_running = False


# Global timer instance
session_timer = SessionTimer()