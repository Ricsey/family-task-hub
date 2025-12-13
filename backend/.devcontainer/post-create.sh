#!/bin/bash
set -e

echo "🚀 Setting up Family Task Hub Backend environment..."

# # Activate venv if it exists
# if [ -d "/workspace/.venv" ]; then
#     echo "✅ Virtual environment found!"
# else
#     echo "📦 Creating virtual environment and installing dependencies..."
#     cd /workspace
#     uv venv /workspace/.venv
#     . /workspace/.venv/bin/activate
#     uv pip install -e .
# fi

echo "✅ Backend development environment setup complete!"
echo ""
# echo "📝 Quick start:"
# echo "  source /workspace/.venv/bin/activate"
# echo "  cd /workspace && uvicorn src.main:app --reload"
