#!/bin/bash
set -e

echo "🚀 Setting up Family Task Hub Frontend environment..."
echo "🗑️ Deleting old dependencies..."
rm -rf node_modules

echo "📦 Installing frontend dependencies..."
cd /workspace/frontend
bun i

echo "✅ Frontend development environment setup complete!"
echo ""
echo "📝 Quick start:"
echo "  bun run dev"
