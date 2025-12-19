curl -LsSf https://astral.sh/uv/install.sh | sh

export UV_VENV_CLEAR=1
rm -rf .venv

uv venv
uv sync --frozen

uv run alembic upgrade head
# unset VIRTUAL_ENV # This conflicts with uv's virtualenv management