FROM mcr.microsoft.com/devcontainers/python:3.12

ENV PYTHONBUFFERED 1

# Ensure the uv binary is in the PATH
ENV PATH="/root/.local/bin:$PATH"

# Install uv globally in the image
RUN curl -LsSf https://astral.sh/uv/install.sh | sh

WORKDIR /workspace/backend