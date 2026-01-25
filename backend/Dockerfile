# Build stage
FROM python:3.12-slim AS builder
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /code

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    uv sync --locked --no-install-project --no-editable

COPY pyproject.toml uv.lock ./

RUN --mount=type=cache,target=/root/.cache/uv \
uv sync --locked --no-editable

ADD . /code

# Final stage
FROM python:3.12-slim

RUN useradd --create-home --shell /usr/sbin/nologin appuser

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
# COPY --from=builder --chown=appuser:appuser /code/.venv /code/.venv
COPY --from=builder --chown=appuser:appuser /code /code
WORKDIR /code
# ENV PATH="/code/.venv/bin:$PATH"

USER appuser
