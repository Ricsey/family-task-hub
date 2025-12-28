#!/bin/bash
set -e

# Navigate to backend directory
cd /workspace/backend

# Install dependencies using the lockfile
uv sync --frozen

# Ensure the .venv is recognized by the shell
echo 'source /workspace/backend/.venv/bin/activate' >> ~/.bashrc

uv run alembic upgrade head