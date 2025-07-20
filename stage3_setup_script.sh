#!/bin/bash
# StudySprint 4.0 - Stage 3 Setup Script
# Implements Study Sessions, Timing, and Analytics

echo "🚀 StudySprint 4.0 - Stage 3 Implementation"
echo "=============================================="
echo "Setting up Advanced Study Features: Session Tracking & Analytics"
echo ""

# Get script directory and project root
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKEND_DIR="$PROJECT_ROOT/backend"

echo "📁 Project root: $PROJECT_ROOT"
echo "📁 Backend directory: $BACKEND_DIR"
echo ""

# Create sessions module directory structure
echo "📂 Creating sessions module structure..."
mkdir -p "$BACKEND_DIR/modules/sessions"
mkdir -p "$BACKEND_DIR/modules/sessions/tests"

# Create __init__.py files
touch "$BACKEND_DIR/modules/sessions/__init__.py"
touch "$BACKEND_DIR/modules/sessions/tests/__init__.py"

echo "✅ Sessions module directories created"

# Create the models file
echo "📄 Creating models.py..."
cat > "$BACKEND_DIR/modules/sessions/models.py" << 'EOF'
# This file will be populated with the Study Sessions models
# Content from the StudySprint 4.0 - Study Sessions Module Models artifact
# Copy the content from the first artifact in this implementation
EOF

# Create the schemas file
echo "📄 Creating schemas.py..."
cat > "$BACKEND_DIR/modules/sessions/schemas.py" << 'EOF'
# This file will be populated with the Study Sessions schemas
# Content from the StudySprint 4.0 - Study Sessions Module Schemas artifact
# Copy the content from the second artifact in this implementation
EOF

# Create the services file
echo "📄 Creating services.py..."
cat > "$BACKEND_DIR/modules/sessions/services.py" << 'EOF'
# This file will be populated with the Study Sessions service layer
# Content from the StudySprint 4.0 - Study Sessions Service Layer artifact
# Copy the content from the third artifact in this implementation
EOF

# Create the routes file
echo "📄 Creating routes.py..."
cat > "$BACKEND_DIR/modules/sessions/routes.py" << 'EOF'
# This file will be populated with the Study Sessions API routes
# Content from the StudySprint 4.0 - Study Sessions API Routes artifact
# Copy the content from the fourth artifact in this implementation
EOF

echo "✅ Module files created"

# Update database models
echo "🗄️  Updating database models..."
echo "⚠️  Manual step required: Update backend/common/database.py with new models"
echo "   Use the 'Updated Database Models with Study Sessions' artifact"

# Create migration file
echo "📄 Creating database migration..."
cat > "$BACKEND_DIR/alembic/versions/002_study_sessions.py" << 'EOF'
# This file will be populated with the database migration
# Content from the StudySprint 4.0 - Study Sessions Database Migration artifact
# Copy the content from the migration artifact
EOF

echo "✅ Migration file template created"

# Update main.py
echo "📄 Updating main.py..."
echo "⚠️  Manual step required: Update backend/main.py with new routes"
echo "   Use the 'Updated Main App with Study Sessions' artifact"

# Update requirements if needed
echo "📦 Checking dependencies..."
cd "$BACKEND_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "🔧 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install any new dependencies (if needed)
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo "✅ Dependencies checked"

# Database operations
echo "🗄️  Database operations..."
echo "⚠️  Manual steps required:"
echo "   1. Copy the content from all artifacts to their respective files"
echo "   2. Run: alembic revision --autogenerate -m 'Add study sessions'"
echo "   3. Run: alembic upgrade head"
echo ""

# Test the setup
echo "🧪 Testing basic setup..."
if python -c "import sys; sys.path.append('.'); from modules.sessions import models" 2>/dev/null; then
    echo "✅ Sessions module imports successfully"
else
    echo "⚠️  Sessions module needs content - copy from artifacts"
fi

echo ""
echo "🎯 Stage 3 Implementation Checklist:"
echo "======================================"
echo ""
echo "📋 Required Manual Steps:"
echo ""
echo "1. 📄 Copy Artifact Content:"
echo "   - Copy 'Study Sessions Database Models' → backend/modules/sessions/models.py"
echo "   - Copy 'Study Sessions API Schemas' → backend/modules/sessions/schemas.py" 
echo "   - Copy 'Study Sessions Service Layer' → backend/modules/sessions/services.py"
echo "   - Copy 'Study Sessions API Routes' → backend/modules/sessions/routes.py"
echo "   - Copy 'Updated Database Models' → backend/common/database.py"
echo "   - Copy 'Updated Main App' → backend/main.py"
echo ""
echo "2. 🗄️  Database Migration:"
echo "   cd backend"
echo "   source venv/bin/activate"
echo "   alembic revision --autogenerate -m 'Add study sessions tables'"
echo "   alembic upgrade head"
echo ""
echo "3. 🚀 Start Services:"
echo "   ./scripts/start_backend.sh"
echo "   ./scripts/start_frontend.sh"
echo ""
echo "4. 🧪 Test New Features:"
echo "   - Visit http://localhost:8000/docs"
echo "   - Test session endpoints in the 'sessions' section"
echo "   - Check http://localhost:8000/api/v1/status for Stage 3 confirmation"
echo ""
echo "📊 New Capabilities After Stage 3:"
echo "=================================="
echo ""
echo "✨ Study Session Management:"
echo "   - Start/pause/resume/end study sessions"
echo "   - Real-time timing with idle detection"
echo "   - Session goals and achievement tracking"
echo ""
echo "🍅 Pomodoro Integration:"
echo "   - Full Pomodoro cycle management"
echo "   - Work/break timing with notifications"
echo "   - Effectiveness and focus ratings"
echo ""
echo "📖 Page-Level Tracking:"
echo "   - Detailed time per PDF page"
echo "   - Reading speed calculation"
echo "   - Activity and interaction monitoring"
echo ""
echo "📈 Advanced Analytics:"
echo "   - Focus and productivity scoring"
echo "   - Study pattern analysis"
echo "   - Personal insights and recommendations"
echo "   - Reading speed trends"
echo ""
echo "🔴 Real-Time Features:"
echo "   - Live session state updates"
echo "   - Server-sent events for timer"
echo "   - Activity monitoring"
echo ""
echo "🎯 Smart Recommendations:"
echo "   - Personalized study suggestions"
echo "   - Optimal study time detection"
echo "   - Environment recommendations"
echo ""
echo "Ready to transform your study experience! 🌟"
echo ""
echo "Next Steps:"
echo "- Complete the manual steps above"
echo "- Test the new session features"
echo "- Stage 4: Note-taking and Knowledge Management"