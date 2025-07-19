#!/bin/bash
# Check StudySprint 4.0 Database Status

echo "📊 StudySprint 4.0 Database Status"
echo "================================="

DB_NAME="studysprint4_local"

if psql $DB_NAME -c "SELECT 1;" >/dev/null 2>&1; then
    echo "✅ Database connection: OK"
    echo ""
    
    echo "📋 Tables:"
    psql $DB_NAME -c "\dt"
    
    echo ""
    echo "📈 Quick Stats:"
    psql $DB_NAME -c "
    SELECT 'Topics: ' || COUNT(*)::text FROM topics
    UNION ALL
    SELECT 'PDFs: ' || COUNT(*)::text FROM pdfs  
    UNION ALL
    SELECT 'Notes: ' || COUNT(*)::text FROM notes;"
    
else
    echo "❌ Database connection failed"
    echo "🔧 Try: createdb studysprint4_local"
fi
