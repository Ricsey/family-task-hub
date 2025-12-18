curl -LsSf https://astral.sh/uv/install.sh | sh
uv sync --frozen
uv run alembic upgrade head
unset VIRTUAL_ENV # This conflicts with uv's virtualenv management