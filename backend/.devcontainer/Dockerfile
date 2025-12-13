FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim as dev

WORKDIR /workspace

ENV PATH="/root/.local/bin:$PATH"

ENV UV_COMPILE_BYTECODE=1
ENV UV_LINK_MODE=copy

# Ensure installed tools can be executed out of the box
ENV UV_TOOL_BIN_DIR=/usr/local/bin

COPY pyproject.toml .
COPY uv.lock .

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml
RUN uv lock
RUN uv sync --locked --no-install-project


WORKDIR /workspace

RUN --mount=type=cache,target=/root/.cache/uv \
uv sync --locked

# Create vscode user
RUN useradd -m -s /bin/bash vscode && \
    mkdir -p /home/vscode/.ssh && \
    mkdir -p /home/vscode/.config && \
    chown -R vscode:vscode /home/vscode

USER vscode

# Copy project files
COPY --chown=vscode:vscode . /workspace

ENV PATH="/workspace/.venv/bin:$PATH"

CMD ["sleep", "infinity"]
