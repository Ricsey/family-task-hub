docker compose build
docker compose run --rm frontend bun install
docker compose run --rm backend uv sync
docker compose run --rm backend uv run alembic upgrade head