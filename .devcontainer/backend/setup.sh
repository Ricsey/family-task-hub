#!/bin/bash
set -e

# Navigate to backend directory
cd /workspace/backend

# Install dependencies using the lockfile
uv sync --frozen

# Ensure the .venv is recognized by the shell
echo 'source /workspace/backend/.venv/bin/activate' >>~/.bashrc

# uv creates venv as root
# to be able to run alembic need to chown
chown -R $(whoami):$(whoami) .venv

uv run alembic upgrade head

