#!/bin/bash
echo "🧹 StudySprint 4.0 - Week 1 Cleanup Starting..."

# Backup current state
echo "📦 Creating backup..."
mkdir -p backups/week1_backup
cp -r backend/modules backups/week1_backup/

# Remove overcomplicated modules that will be rebuilt
echo "🗑️  Removing overcomplicated modules..."

# Remove exercises module (not in current plan)
if [ -d "backend/modules/exercises" ]; then
    echo "  - Removing exercises module"
    rm -rf backend/modules/exercises
fi

# Remove monitoring module (Stage 8 feature)
if [ -d "backend/modules/monitoring" ]; then
    echo "  - Removing monitoring module"
    rm -rf backend/modules/monitoring
fi

# Clean up analytics module (will rebuild in Stage 6)
if [ -d "backend/modules/analytics" ]; then
    echo "  - Backing up and simplifying analytics module"
    mv backend/modules/analytics backups/week1_backup/analytics_complex
    mkdir -p backend/modules/analytics
    # Create basic placeholder
    cat > backend/modules/analytics/__init__.py << 'INIT'
# StudySprint 4.0 - Analytics Module (Stage 6)
# Simplified placeholder - will be rebuilt
INIT
fi

# Clean up goals module (will rebuild in Stage 4)
if [ -d "backend/modules/goals" ]; then
    echo "  - Backing up and simplifying goals module"
    mv backend/modules/goals backups/week1_backup/goals_complex
    mkdir -p backend/modules/goals
    cat > backend/modules/goals/__init__.py << 'INIT'
# StudySprint 4.0 - Goals Module (Stage 4)
# Simplified placeholder - will be rebuilt
INIT
fi

echo "✅ Module cleanup completed!"
