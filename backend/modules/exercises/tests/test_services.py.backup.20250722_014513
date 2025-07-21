# backend/modules/exercises/tests/test_services.py
import pytest
from datetime import datetime, timedelta
from sqlalchemy.orm import Session

from backend.modules.exercises.services import ExerciseService, ExerciseSetService
from backend.modules.exercises.schemas import ExerciseCreate, ExerciseAttemptCreate, ExerciseSetCreate
from backend.modules.exercises.models import Exercise, ExerciseAttempt, SpacedRepetitionSchedule

class TestExerciseService:
    
    def test_create_exercise(self, db_session: Session):
        """Test exercise creation with difficulty assessment"""
        service = ExerciseService(db_session)
        
        exercise_data = ExerciseCreate(
            title="Basic Python Question",
            question="What is the output of print(2 + 3)?",
            answer="5",
            explanation="Basic arithmetic in Python",
            topic_id=1,
            exercise_type="multiple_choice",
            estimated_time=2
        )
        
        exercise = service.create_exercise(exercise_data)
        
        assert exercise.id is not None
        assert exercise.title == "Basic Python Question"
        assert exercise.difficulty > 0
        assert exercise.ease_factor == 2.5  # Default SuperMemo value
        
        # Check spaced repetition schedule was created
        schedule = db_session.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.exercise_id == exercise.id
        ).first()
        assert schedule is not None
        assert schedule.current_interval == 1

    def test_difficulty_assessment(self, db_session: Session):
        """Test AI difficulty assessment algorithm"""
        service = ExerciseService(db_session)
        
        # Simple question should have lower difficulty
        simple_exercise = ExerciseCreate(
            title="Simple Math",
            question="What is 2 + 2?",
            answer="4",
            topic_id=1
        )
        simple = service.create_exercise(simple_exercise)
        
        # Complex question should have higher difficulty
        complex_exercise = ExerciseCreate(
            title="Complex Analysis",
            question="Analyze the socioeconomic implications of artificial intelligence implementation in developing countries, considering both technological advancement opportunities and potential displacement of traditional labor markets.",
            answer="This requires comprehensive analysis of multiple factors including economic development patterns, technological infrastructure, educational systems, and labor market dynamics...",
            topic_id=1
        )
        complex = service.create_exercise(complex_exercise)
        
        assert complex.difficulty > simple.difficulty
        assert simple.difficulty >= 1.0
        assert complex.difficulty <= 5.0

    def test_submit_correct_attempt(self, db_session: Session):
        """Test submitting a correct exercise attempt"""
        service = ExerciseService(db_session)
        
        # Create exercise
        exercise_data = ExerciseCreate(
            title="Test Question",
            question="What is the capital of France?",
            answer="Paris",
            topic_id=1
        )
        exercise = service.create_exercise(exercise_data)
        
        # Submit correct attempt
        attempt_data = ExerciseAttemptCreate(
            exercise_id=exercise.id,
            user_answer="Paris",
            confidence_level=5,
            time_taken=30
        )
        
        attempt = service.submit_attempt(attempt_data)
        
        assert attempt.is_correct == True
        assert attempt.score == 1.0
        assert attempt.confidence_level == 5
        
        # Check spaced repetition was updated
        schedule = db_session.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.exercise_id == exercise.id
        ).first()
        assert schedule.total_reviews == 1
        assert schedule.consecutive_correct == 1

    def test_submit_incorrect_attempt(self, db_session: Session):
        """Test submitting an incorrect exercise attempt"""
        service = ExerciseService(db_session)
        
        # Create exercise
        exercise_data = ExerciseCreate(
            title="Test Question",
            question="What is the capital of France?",
            answer="Paris",
            topic_id=1
        )
        exercise = service.create_exercise(exercise_data)
        
        # Submit incorrect attempt
        attempt_data = ExerciseAttemptCreate(
            exercise_id=exercise.id,
            user_answer="London",
            confidence_level=2,
            time_taken=45
        )
        
        attempt = service.submit_attempt(attempt_data)
        
        assert attempt.is_correct == False
        assert attempt.score == 0.0
        
        # Check spaced repetition reset
        schedule = db_session.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.exercise_id == exercise.id
        ).first()
        assert schedule.consecutive_correct == 0
        assert schedule.current_interval == 1  # Reset to 1 day

    def test_spaced_repetition_algorithm(self, db_session: Session):
        """Test SuperMemo spaced repetition algorithm"""
        service = ExerciseService(db_session)
        
        # Create exercise
        exercise_data = ExerciseCreate(
            title="Test Question",
            question="Test question?",
            answer="Test answer",
            topic_id=1
        )
        exercise = service.create_exercise(exercise_data)
        
        # Get initial schedule
        schedule = db_session.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.exercise_id == exercise.id
        ).first()
        initial_interval = schedule.current_interval
        initial_ease = schedule.ease_factor
        
        # Submit multiple correct attempts
        for i in range(3):
            attempt_data = ExerciseAttemptCreate(
                exercise_id=exercise.id,
                user_answer="Test answer",
                confidence_level=4,
                time_taken=30
            )
            service.submit_attempt(attempt_data)
            
            # Refresh schedule
            db_session.refresh(schedule)
            
            # Interval should increase
            if i > 0:  # After first attempt
                assert schedule.current_interval > initial_interval
                
        # Ease factor should be maintained or improved
        assert schedule.ease_factor >= initial_ease

    def test_get_due_exercises(self, db_session: Session):
        """Test getting exercises due for review"""
        service = ExerciseService(db_session)
        
        # Create exercises with different due dates
        past_due_exercise = ExerciseCreate(
            title="Past Due",
            question="Question 1?",
            answer="Answer 1",
            topic_id=1
        )
        exercise1 = service.create_exercise(past_due_exercise)
        
        # Manually set as overdue
        schedule1 = db_session.query(SpacedRepetitionSchedule).filter(
            SpacedRepetitionSchedule.exercise_id == exercise1.id
        ).first()
        schedule1.next_review_date = datetime.utcnow() - timedelta(days=1)
        schedule1.priority_score = 2.0
        db_session.commit()
        
        # Create current due exercise
        current_due_exercise = ExerciseCreate(
            title="Current Due",
            question="Question 2?", 
            answer="Answer 2",
            topic_id=1
        )
        exercise2 = service.create_exercise(current_due_exercise)
        
        # Get due exercises
        due_exercises = service.get_due_exercises(10)
        
        assert len(due_exercises) >= 2
        # Past due should come first (higher priority)
        due_ids = [e.id for e in due_exercises]
        assert exercise1.id in due_ids
        assert exercise2.id in due_ids

    def test_exercise_analytics(self, db_session: Session):
        """Test exercise analytics calculation"""
        service = ExerciseService(db_session)
        
        # Create exercises and attempts
        exercise_data = ExerciseCreate(
            title="Analytics Test",
            question="Test question?",
            answer="Test answer",
            topic_id=1
        )
        exercise = service.create_exercise(exercise_data)
        
        # Submit some attempts
        for i in range(5):
            attempt_data = ExerciseAttemptCreate(
                exercise_id=exercise.id,
                user_answer="Test answer" if i < 3 else "Wrong answer",
                confidence_level=4,
                time_taken=30 + i * 10
            )
            service.submit_attempt(attempt_data)
        
        # Get analytics
        analytics = service.get_exercise_analytics()
        
        assert analytics['total_exercises'] >= 1
        assert analytics['exercises_completed'] >= 1
        assert analytics['completion_rate'] > 0
        assert analytics['average_score'] > 0
        assert analytics['time_spent'] > 0

class TestExerciseSetService:
    
    def test_create_exercise_set(self, db_session: Session):
        """Test exercise set creation"""
        # First create some exercises
        exercise_service = ExerciseService(db_session)
        exercises = []
        
        for i in range(3):
            exercise_data = ExerciseCreate(
                title=f"Exercise {i+1}",
                question=f"Question {i+1}?",
                answer=f"Answer {i+1}",
                topic_id=1,
                estimated_time=5
            )
            exercise = exercise_service.create_exercise(exercise_data)
            exercises.append(exercise)
        
        # Create exercise set
        set_service = ExerciseSetService(db_session)
        set_data = ExerciseSetCreate(
            title="Test Exercise Set",
            description="A test set of exercises",
            topic_id=1,
            exercise_ids=[e.id for e in exercises],
            is_sequential=True,
            passing_score=0.8
        )
        
        exercise_set = set_service.create_exercise_set(set_data)
        
        assert exercise_set.id is not None
        assert exercise_set.title == "Test Exercise Set"
        assert exercise_set.total_exercises == 3
        assert exercise_set.average_difficulty > 0
        assert exercise_set.estimated_duration == 15  # 5 minutes * 3 exercises
        assert exercise_set.is_sequential == True

    def test_set_progress_tracking(self, db_session: Session):
        """Test exercise set progress calculation"""
        # Create exercises and set
        exercise_service = ExerciseService(db_session)
        exercises = []
        
        for i in range(2):
            exercise_data = ExerciseCreate(
                title=f"Progress Exercise {i+1}",
                question=f"Question {i+1}?",
                answer=f"Answer {i+1}",
                topic_id=1
            )
            exercise = exercise_service.create_exercise(exercise_data)
            exercises.append(exercise)
        
        set_service = ExerciseSetService(db_session)
        set_data = ExerciseSetCreate(
            title="Progress Test Set",
            topic_id=1,
            exercise_ids=[e.id for e in exercises]
        )
        exercise_set = set_service.create_exercise_set(set_data)
        
        # Complete one exercise
        attempt_data = ExerciseAttemptCreate(
            exercise_id=exercises[0].id,
            user_answer="Answer 1",
            confidence_level=4,
            time_taken=30
        )
        exercise_service.submit_attempt(attempt_data)
        
        # Get progress
        progress = set_service.get_set_progress(exercise_set.id)
        
        assert progress['total_exercises'] == 2
        assert progress['completed_exercises'] == 1
        assert progress['completion_rate'] == 0.5
        assert progress['is_completed'] == False
        assert len(progress['exercises']) == 2

    def test_invalid_exercise_set_creation(self, db_session: Session):
        """Test validation when creating exercise set with invalid exercises"""
        set_service = ExerciseSetService(db_session)
        
        # Try to create set with non-existent exercises
        set_data = ExerciseSetCreate(
            title="Invalid Set",
            topic_id=1,
            exercise_ids=[9999, 9998]  # Non-existent IDs
        )
        
        with pytest.raises(ValueError):
            set_service.create_exercise_set(set_data)

