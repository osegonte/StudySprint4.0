# StudySprint Frontend

## Local Development

### 1. Install dependencies
```sh
npm install
```

### 2. Start the development server
```sh
npm run dev
```
- The app runs at http://localhost:3000
- API requests to `/api` are proxied to the backend at http://localhost:8000

### 3. Run Storybook (UI component library)
```sh
npm run storybook
```
- Storybook runs at http://localhost:6006

### 4. Run tests
- **Unit/Component tests:**
  ```sh
  npm run test
  ```
- **E2E tests:**
  ```sh
  npx cypress open
  ```

### 5. Lint and format code
```sh
npm run lint
npx prettier --write .
```

### 6. Pre-commit hooks
- Husky runs lint and tests before each commit.

---

## Project Structure
- `src/components/ui/` - UI primitives
- `src/store/` - Zustand state stores
- `src/services/` - API client
- `src/types/` - TypeScript types
- `src/pages/` - Main route pages

---

## Environment
- Vite + React + TypeScript
- Tailwind CSS (Apple HIG-inspired)
- Zustand (state)
- React Query (data fetching)
- Storybook (UI library)
- Cypress (E2E)
- React Testing Library (unit/component) 

### Backend Setup Assessment

**You have:**
- All required backend code and structure (`main.py`, `requirements.txt`, `alembic`, `modules`, etc.).
- Alembic migrations and config for PostgreSQL (`studysprint4_local`).
- FastAPI app with CORS, trusted hosts, and modular router loading.
- SQLAlchemy setup with environment-based database URL.

**You are missing:**
- A backend `README.md` or setup guide for new developers.
- A `.env` file for local environment variables (recommended for secrets and DB URL).
- Possibly, some environment variable loading in code (your `config.py` is empty).

---

## 🛠️ **Step-by-Step Backend Setup Instructions**

### 1. **Create and Activate a Python Virtual Environment**
```sh
cd backend
python3 -m venv venv
source venv/bin/activate
```

### 2. **Install Python Dependencies**
```sh
pip install -r requirements.txt
```

### 3. **Set Up Environment Variables**
Create a `.env` file in `backend/` with:
```
DATABASE_URL=postgresql://osegonte@localhost:5432/studysprint4_local
SECRET_KEY=your_secret_key
```
> (You can add more variables as needed for JWT, email, etc.)

### 4. **Ensure Environment Variables Are Loaded**
- Install `python-dotenv` (already in requirements).
- At the top of `main.py`, add:
  ```python
  from dotenv import load_dotenv
  load_dotenv()
  ```
- Or, add this to `common/config.py` and import it in `main.py`.

### 5. **Run Database Migrations**
```sh
alembic upgrade head
```

### 6. **Start the Backend Server**
```sh
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 7. **Test the API**
- Visit [http://localhost:8000/docs](http://localhost:8000/docs) for the interactive API docs.
- Health check: [http://localhost:8000/health](http://localhost:8000/health)

---

## 📝 **Recommended: Add a backend/README.md**

Would you like me to generate a complete backend `README.md` with these instructions and best practices for your team?  
Or, should I add `.env` loading to your codebase for robust local development?

Let me know your preference, or I can do both! 