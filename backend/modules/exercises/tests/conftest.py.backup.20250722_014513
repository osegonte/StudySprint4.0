# backend/modules/exercises/tests/conftest.py
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.database import Base

@pytest.fixture
def db_session():
    """Create a test database session"""
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    
    SessionLocal = sessionmaker(bind=engine)
    session = SessionLocal()
    
    # Create test topic
    from backend.modules.topics.models import Topic
    test_topic = Topic(title="Test Topic", description="Test topic for exercises")
    session.add(test_topic)
    session.commit()
    
    yield session
    
    session.close()

# Run tests with: pytest backend/modules/exercises/tests/