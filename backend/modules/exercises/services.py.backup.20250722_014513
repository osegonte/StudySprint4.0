from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from .models import Exercise, ExerciseAttempt
from .schemas import ExerciseCreate, ExerciseUpdate, ExerciseAttemptCreate

class ExerciseService:
    def __init__(self, db: Session):
        self.db = db

    def create_exercise(self, exercise_data: ExerciseCreate) -> Exercise:
        """Create new exercise"""
        difficulty = self._assess_difficulty(exercise_data.question, exercise_data.answer)
        
        exercise = Exercise(
            title=exercise_data.title,
            description=exercise_data.description,
            question=exercise_data.question,
            answer=exercise_data.answer,
            explanation=exercise_data.explanation,
            topic_id=exercise_data.topic_id,
            exercise_type=exercise_data.exercise_type,
            estimated_time=exercise_data.estimated_time,
            difficulty=difficulty
        )
        
        self.db.add(exercise)
        self.db.commit()
        self.db.refresh(exercise)
        
        # Add performance metrics
        self._add_performance_metrics(exercise)
        
        return exercise

    def get_exercise(self, exercise_id: int) -> Optional[Exercise]:
        """Get exercise with performance metrics"""
        exercise = self.db.query(Exercise).filter(Exercise.id == exercise_id).first()
        if exercise:
            self._add_performance_metrics(exercise)
        return exercise

    def submit_attempt(self, attempt_data: ExerciseAttemptCreate) -> ExerciseAttempt:
        """Submit exercise attempt"""
        exercise = self.db.query(Exercise).filter(Exercise.id == attempt_data.exercise_id).first()
        if not exercise:
            raise ValueError("Exercise not found")
            
        is_correct, score = self._evaluate_answer(
            exercise.answer, 
            attempt_data.user_answer, 
            exercise.exercise_type
        )
        
        attempt = ExerciseAttempt(
            exercise_id=attempt_data.exercise_id,
            user_answer=attempt_data.user_answer,
            is_correct=is_correct,
            score=score,
            time_taken=attempt_data.time_taken,
            confidence_level=attempt_data.confidence_level
        )
        
        self.db.add(attempt)
        self.db.commit()
        self.db.refresh(attempt)
        
        # Add exercise details for response
        attempt.exercise_title = exercise.title
        attempt.correct_answer = exercise.answer
        attempt.explanation = exercise.explanation
        
        return attempt

    def get_exercise_analytics(self, topic_id: Optional[str] = None) -> Dict[str, Any]:
        """Get comprehensive exercise analytics"""
        query = self.db.query(Exercise)
        if topic_id:
            query = query.filter(Exercise.topic_id == topic_id)
            
        exercises = query.filter(Exercise.is_active == True).all()
        
        if not exercises:
            return {
                "total_exercises": 0,
                "exercises_completed": 0,
                "completion_rate": 0.0,
                "average_score": 0.0,
                "time_spent": 0,
                "exercises_due": 0,
                "improvement_trend": "no_data"
            }
            
        total_exercises = len(exercises)
        attempts = self.db.query(ExerciseAttempt).filter(
            ExerciseAttempt.exercise_id.in_([e.id for e in exercises])
        ).all()
        
        exercises_completed = len(set(attempt.exercise_id for attempt in attempts))
        completion_rate = exercises_completed / total_exercises if total_exercises > 0 else 0
        
        average_score = sum(a.score for a in attempts) / len(attempts) if attempts else 0
        time_spent = sum(a.time_taken for a in attempts if a.time_taken) // 60  # Convert to minutes
        
        return {
            "total_exercises": total_exercises,
            "exercises_completed": exercises_completed,
            "completion_rate": completion_rate,
            "average_score": average_score,
            "time_spent": time_spent,
            "exercises_due": 0,
            "improvement_trend": "stable"
        }

    def _assess_difficulty(self, question: str, answer: str) -> float:
        """Simple difficulty assessment"""
        question_length = len(question.split())
        answer_length = len(answer.split())
        
        complexity_score = 1.0
        
        if question_length > 20:
            complexity_score += 0.5
        if answer_length > 10:
            complexity_score += 0.3
            
        return min(complexity_score, 5.0)

    def _evaluate_answer(self, correct_answer: str, user_answer: str, exercise_type: str) -> tuple[bool, float]:
        """Evaluate user answer"""
        if exercise_type in ["multiple_choice", "true_false"]:
            is_correct = correct_answer.strip().lower() == user_answer.strip().lower()
            return is_correct, 1.0 if is_correct else 0.0
        else:
            # Simple similarity for other types
            similarity = self._calculate_similarity(correct_answer, user_answer)
            is_correct = similarity >= 0.7
            return is_correct, similarity

    def _calculate_similarity(self, text1: str, text2: str) -> float:
        """Calculate text similarity"""
        words1 = set(text1.lower().split())
        words2 = set(text2.lower().split())
        
        if not words1 and not words2:
            return 1.0
        if not words1 or not words2:
            return 0.0
            
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union)

    def _add_performance_metrics(self, exercise: Exercise):
        """Add calculated performance metrics"""
        attempts = self.db.query(ExerciseAttempt).filter(
            ExerciseAttempt.exercise_id == exercise.id
        ).all()
        
        exercise.total_attempts = len(attempts)
        
        if attempts:
            correct_attempts = [a for a in attempts if a.is_correct]
            exercise.success_rate = len(correct_attempts) / len(attempts)
            exercise.average_time = sum(a.time_taken for a in attempts if a.time_taken) / len(attempts)
            exercise.last_attempted = max(a.attempted_at for a in attempts)
        else:
            exercise.success_rate = 0.0
            exercise.average_time = 0.0
            exercise.last_attempted = None
