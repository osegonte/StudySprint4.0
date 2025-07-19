# StudySprint 4.0 - Development Guide

## 🏗️ Architecture Overview

StudySprint 4.0 is built with:
- **Backend**: Python FastAPI with PostgreSQL
- **Frontend**: React TypeScript with Vite  
- **Database**: Local PostgreSQL (studysprint4_local)
- **Development**: Local setup (no Docker required)

## 🚀 Quick Start

### Start Backend
```bash
cd scripts
./start_backend.sh
```
Access: http://localhost:8000 (API docs: /docs)

### Start Frontend  
```bash
cd scripts
./start_frontend.sh
```
Access: http://localhost:3000

### Database Management
```bash
# Check database status
./scripts/db_status.sh

# Connect to database
./scripts/db_connect.sh
```

## 📁 Project Structure

```
StudySprint4.0/
├── backend/                 # Python FastAPI
│   ├── modules/            # Feature modules
│   ├── common/             # Shared utilities
│   ├── main.py             # Application entry
│   └── venv/               # Virtual environment
├── frontend/               # React TypeScript
│   ├── src/modules/        # Feature components
│   └── src/common/         # Shared components
├── uploads/                # File storage
├── scripts/                # Development scripts
└── setup_backup/           # Configuration backups
```

## 🗄️ Database

- **Name**: studysprint4_local
- **User**: osegonte
- **Host**: localhost:5432
- **Tables**: topics, pdfs, notes

## 📋 Development Workflow

1. **Start Backend**: `./scripts/start_backend.sh`
2. **Start Frontend**: `./scripts/start_frontend.sh`  
3. **Develop Features**: Implement in respective modules
4. **Test**: Use API docs at http://localhost:8000/docs

## 🎯 Current Status

- ✅ **Stage 1**: Foundation Complete
- 🔄 **Stage 2**: PDF Management & Viewer (Next)

## 🛠️ Next Steps

Begin implementing Stage 2 features:
1. PDF upload and management
2. PDF viewer with PDF.js
3. File organization system
4. Basic study session tracking

Ready to build! 🚀
