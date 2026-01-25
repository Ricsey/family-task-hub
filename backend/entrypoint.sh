#!/bin/bash
set -e

echo "Running migrations..."
uv run python -m alembic upgrade head

echo "Starting app..."
uv run python -m uvicorn src.main:app --host 0.0.0.0 --port 8000