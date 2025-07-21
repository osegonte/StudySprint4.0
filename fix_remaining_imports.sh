#!/bin/bash

# 🔧 FIX REMAINING IMPORT ISSUES IN STUDYSPRINT
# Fix the "No module named 'common'" and "No module named 'database'" errors

echo "🔧 Diagnosing remaining import issues..."

# Check project structure
echo "📁 Project structure:"
ls -la backend/

echo ""
echo "📁 Common directory contents:"
ls -la backend/common/ 2>/dev/null || echo "❌ No common directory found"

echo ""
echo "📁 Database file:"
ls -la backend/database.py 2>/dev/null || echo "❌ No database.py found"

echo ""
echo "🔍 Checking imports in modules..."

# Check a few module files to understand import patterns
echo ""
echo "📄 Topics routes imports:"
head -10 backend/modules/topics/routes.py 2>/dev/null || echo "❌ File not found"

echo ""
echo "📄 Topics models imports:"
head -10 backend/modules/topics/models.py 2>/dev/null || echo "❌ File not found"

echo ""
echo "📄 Sessions routes imports:"
head -10 backend/modules/sessions/routes.py 2>/dev/null || echo "❌ File not found"

# Function to fix imports in a file
fix_imports_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "🔧 Fixing imports in $file..."
        
        # Create backup
        cp "$file" "${file}.backup.$(date +%Y%m%d_%H%M%S)"
        
        # Fix common imports
        sed -i '' 's/from common\./from backend.common./g' "$file"
        sed -i '' 's/import common\./import backend.common./g' "$file"
        sed -i '' 's/from common import/from backend.common import/g' "$file"
        
        # Fix database imports
        sed -i '' 's/from database import/from backend.database import/g' "$file"
        sed -i '' 's/import database/import backend.database/g' "$file"
        
        # Fix relative imports to absolute
        sed -i '' 's/from \.database import/from backend.database import/g' "$file"
        sed -i '' 's/from \.common/from backend.common/g' "$file"
        
        echo "✅ Fixed imports in $file"
    else
        echo "⚠️  File not found: $file"
    fi
}

echo ""
echo "🛠️  Applying import fixes to all module files..."

# Fix imports in all Python files in modules
find backend/modules -name "*.py" -type f | while read file; do
    fix_imports_in_file "$file"
done

# Also fix any imports in the main backend files
fix_imports_in_file "backend/database.py"

# Check if we have __init__.py files for proper module structure
echo ""
echo "📦 Ensuring proper module structure..."

# Make sure backend is a proper Python package
touch backend/__init__.py

# Make sure common is a proper package if it exists
if [ -d "backend/common" ]; then
    touch backend/common/__init__.py
    echo "✅ Made backend/common a proper package"
fi

# Make sure each module is a proper package
for module_dir in backend/modules/*/; do
    if [ -d "$module_dir" ]; then
        touch "${module_dir}__init__.py"
        module_name=$(basename "$module_dir")
        echo "✅ Made backend/modules/$module_name a proper package"
    fi
done

echo ""
echo "🎯 Testing the fixes..."

# Quick test to see what imports are still failing
echo "🧪 Testing import fixes by checking first few lines of problematic files..."

echo ""
echo "📄 Topics routes after fix:"
head -5 backend/modules/topics/routes.py 2>/dev/null | grep -E "import|from" || echo "No import issues visible"

echo ""
echo "📄 PDFs routes after fix:"
head -5 backend/modules/pdfs/routes.py 2>/dev/null | grep -E "import|from" || echo "No import issues visible"

echo ""
echo "✅ Import fixes applied!"
echo ""
echo "🚀 Next steps:"
echo "1. Restart your backend:"
echo "   # Stop current server (Ctrl+C)"
echo "   python -m uvicorn backend.main:app --reload"
echo ""
echo "2. Check which modules load successfully"
echo ""
echo "3. If still having issues, run:"
echo "   ls -la backend/common/"
echo "   cat backend/database.py | head -5"
echo ""
echo "✨ Import path fixes complete!"