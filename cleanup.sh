#!/bin/bash
# cleanup.sh - Remove unnecessary files and optimize project structure

echo "🧹 StudySprint 4.0 - Project Cleanup"
echo "======================================"

cd "$(dirname "$0")/.."

# Remove unnecessary development files
echo "📂 Cleaning development artifacts..."

# Remove Python cache files
find . -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null
find . -name "*.pyc" -delete 2>/dev/null
find . -name "*.pyo" -delete 2>/dev/null
find . -name "*.pyd" -delete 2>/dev/null

# Remove node_modules cache (but keep actual dependencies)
if [ -d "frontend/node_modules/.cache" ]; then
    rm -rf frontend/node_modules/.cache
    echo "✅ Removed frontend cache"
fi

# Remove build artifacts
rm -rf frontend/dist/ 2>/dev/null
rm -rf frontend/build/ 2>/dev/null

# Remove backup files
find . -name "*.bak" -delete 2>/dev/null
find . -name "*.backup" -delete 2>/dev/null
find . -name "*~" -delete 2>/dev/null

# Remove empty test files in backend modules
echo "📂 Cleaning empty module files..."
for module in backend/modules/*/; do
    if [ -d "$module" ]; then
        # Remove empty __init__.py files in test directories
        if [ -f "$module/tests/__init__.py" ] && [ ! -s "$module/tests/__init__.py" ]; then
            rm "$module/tests/__init__.py"
        fi
        
        # Remove empty test files
        for test_file in "$module/tests/"*.py; do
            if [ -f "$test_file" ] && [ ! -s "$test_file" ]; then
                rm "$test_file"
                echo "  Removed empty: $test_file"
            fi
        done
        
        # Remove empty models/schemas/services if they exist and are empty
        for file in "$module"models.py "$module"schemas.py "$module"services.py; do
            if [ -f "$file" ] && [ ! -s "$file" ]; then
                rm "$file"
                echo "  Removed empty: $file"
            fi
        done
    fi
done

# Remove unused common files
echo "📂 Cleaning common module..."
for file in backend/common/ai_services.py backend/common/config.py backend/common/errors.py backend/common/middleware.py backend/common/utils.py; do
    if [ -f "$file" ] && [ ! -s "$file" ]; then
        rm "$file"
        echo "  Removed empty: $file"
    fi
done

# Clean up empty directories
echo "📂 Removing empty directories..."
find . -type d -empty -delete 2>/dev/null

# Remove setup backup if it exists
if [ -d "setup_backup" ]; then
    rm -rf setup_backup
    echo "✅ Removed setup backup directory"
fi

# Remove unnecessary docker files if not using Docker
if [ -f "docker-compose.yml" ] && [ -f "backend/Dockerfile" ]; then
    echo "📦 Docker files detected but not needed for local development"
    echo "   Consider removing docker-compose.yml and Dockerfiles if not using Docker"
fi

# Clean up logs
rm -f backend/*.log 2>/dev/null
rm -f frontend/*.log 2>/dev/null

# Update .gitignore to prevent future clutter
echo "📝 Updating .gitignore..."
cat >> .gitignore << 'EOF'

# Additional cleanup patterns
*.tmp
*.temp
.DS_Store
.vscode/settings.json
.idea/
*.swp
*.swo
*~

# Python
__pycache__/
*.py[cod]
*$py.class
*.so

# Virtual environments
venv/
env/
ENV/

# Frontend
node_modules/.cache/
dist/
build/
*.tsbuildinfo

# Database
*.sqlite
*.db

# Logs
*.log
npm-debug.log*
yarn-debug.log*

# OS
Thumbs.db
.DS_Store

EOF

echo ""
echo "✅ Cleanup complete!"
echo ""
echo "📊 Project size summary:"
du -sh . 2>/dev/null || echo "  Size calculation not available"
echo ""
echo "📋 Remaining structure:"
echo "  ├── backend/           (API server)"
echo "  ├── frontend/          (React app)"
echo "  ├── uploads/           (PDF storage)"
echo "  ├── scripts/           (Start scripts)"
echo "  └── configuration files"
echo ""
echo "🚀 Ready for Stage 3!"