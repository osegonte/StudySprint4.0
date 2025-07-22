#!/bin/bash
# StudySprint 4.0 - Fix Setup Issues

echo "🔧 Fixing setup issues..."

# Create the missing tsconfig.node.json
echo "📝 Creating tsconfig.node.json..."
cat > tsconfig.node.json << 'EOF2'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF2

# Fix husky setup
echo "🔧 Fixing husky setup..."
mkdir -p .husky
echo "npx lint-staged" > .husky/pre-commit
chmod +x .husky/pre-commit

# Also run npm audit fix to address the security warnings
echo "🔒 Fixing security vulnerabilities..."
npm audit fix

echo "✅ Setup fixes complete!"
echo ""
echo "🚀 Try running the development server again:"
echo "npm run dev"
