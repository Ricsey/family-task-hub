#!/bin/bash
set -e

echo "Installing frontend dependencies..."
cd /workspaces/family-task-hub/frontend && bun install

echo "Installing backend dependencies..."
cd /workspaces/family-task-hub/backend && uv sync
