# StudySprint 4.0 Backend

## Overview
Production-ready FastAPI backend for StudySprint 4.0, supporting advanced study management, analytics, and real-time features.

---

## 🛠️ Setup Instructions

### 1. Create and Activate a Python Virtual Environment
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Python Dependencies
```sh
pip install -r requirements.txt
```

### 3. Set Up Environment Variables
Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgresql://osegonte@localhost:5432/studysprint4_local
SECRET_KEY=your_secret_key
```

### 4. Run Database Migrations
```sh
alembic upgrade head
```

### 5. Start the Backend Server
```sh
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 6. Test the API
- Visit [http://localhost:8000/docs](http://localhost:8000/docs) for interactive API docs.
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📦 Project Structure
- `main.py` - FastAPI app entrypoint, router registration
- `common/` - Shared config and database setup
- `modules/` - Feature modules (topics, pdfs, sessions, notes, exercises, goals, analytics, monitoring)
- `alembic/` - Database migrations
- `uploads/` - PDF and file storage

---

## 🔑 Key Features
- Modular architecture (each feature in its own module)
- Alembic migrations for schema management
- Robust environment config with `.env` and `python-dotenv`
- Real-time WebSocket endpoints for session analytics
- Advanced analytics, focus scoring, and gamification
- Comprehensive API with validation and error handling

---

## 🧑‍💻 Developer Best Practices
- Use virtual environments for Python dependencies
- Keep `.env` out of version control
- Run `alembic revision --autogenerate -m "..."` after model changes
- Write and run tests for all modules
- Use [http://localhost:8000/docs](http://localhost:8000/docs) for API exploration

---

## 🚀 Production Checklist
- Set secure values for all secrets in `.env`
- Use a production-grade database (not local dev)
- Set up HTTPS and CORS for deployment
- Monitor logs and error reports
- Regularly backup the database

---

## 📞 Support
For help, contact the StudySprint 4.0 backend team. 