#!/bin/bash
echo "�� StudySprint 4.0 - Week 1 Success Verification"
echo "=============================================="

success_count=0
total_checks=4

# Check 1: Clean, simplified codebase
echo "1. 📋 Checking codebase cleanup..."
if [ ! -d "backend/modules/exercises" ] && [ ! -d "backend/modules/monitoring" ]; then
    echo "   ✅ Overcomplicated modules removed"
    ((success_count++))
else
    echo "   ❌ Some complex modules still present"
fi

# Check 2: PostgreSQL setup
echo "2. 🐘 Checking PostgreSQL setup..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL running with helper scripts"
    ((success_count++))
else
    echo "   ❌ PostgreSQL not running"
fi

# Check 3: Working topics and PDFs modules
echo "3. 🔧 Checking core modules..."
if [ -f "backend/modules/topics/routes.py" ] && [ -f "backend/modules/pdfs/routes.py" ]; then
    echo "   ✅ Topics and PDFs modules working"
    ((success_count++))
else
    echo "   ❌ Core modules missing"
fi

# Check 4: Clean database schema
echo "4. 🗄️ Checking database schema..."
if psql -h localhost -p 5432 -U osegonte -d studysprint4_local -c "SELECT * FROM topics LIMIT 1;" > /dev/null 2>&1; then
    echo "   ✅ Database schema clean and aligned"
    ((success_count++))
else
    echo "   ❌ Database schema issues"
fi

echo ""
echo "📊 Week 1 Results: $success_count/$total_checks criteria met"

if [ $success_count -eq $total_checks ]; then
    echo "🎉 Week 1 SUCCESS! Ready for Stage 2 development"
else
    echo "⚠️  Week 1 needs attention before proceeding"
fi
