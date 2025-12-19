#!/bin/bash
set -e

echo "🚀 Setting up Family Task Hub Frontend environment..."

# # Install frontend dependencies if not already installed
# if [ ! -d "/workspace/node_modules" ]; then
#     echo "📦 Installing frontend dependencies..."
#     cd /workspace
#     npm install
# fi
cd /workspace/frontend
bun i

echo "✅ Frontend development environment setup complete!"
echo ""
echo "📝 Quick start:"
echo "  bun run dev"
