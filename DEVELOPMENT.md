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
./scripts/start_backend.sh
```
Access: http://localhost:8000 (API docs: /docs)

### Start Frontend  
```bash
./scripts/start_frontend.sh
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
│   │   ├── topics/         # ✅ Topic management
│   │   └── pdfs/           # ✅ PDF management
│   ├── common/             # Shared utilities
│   ├── main.py             # Application entry
│   └── venv/               # Virtual environment
├── frontend/               # React TypeScript
│   ├── src/modules/        # Feature components
│   │   ├── topics/         # ✅ Topic components
│   │   └── pdfs/           # ✅ PDF components
│   └── src/common/         # Shared components
├── uploads/                # File storage
├── scripts/                # Development scripts
└── configuration files
```

## 🗄️ Database

- **Name**: studysprint4_local
- **User**: osegonte
- **Host**: localhost:5432
- **Tables**: topics, pdfs

## 📋 Development Workflow

1. **Start Backend**: `./scripts/start_backend.sh`
2. **Start Frontend**: `./scripts/start_frontend.sh`  
3. **Develop Features**: Implement in respective modules
4. **Test**: Use API docs at http://localhost:8000/docs

## 🎯 Current Status

- ✅ **Stage 1**: Foundation Complete
- ✅ **Stage 2**: PDF Management & Viewer Complete
- 🔄 **Stage 3**: Advanced Features (Next)

## 🛠️ Next Steps

Begin implementing Stage 3 features:
1. Study session tracking
2. Note-taking system
3. Advanced analytics
4. Progress visualization

Ready to build! 🚀
