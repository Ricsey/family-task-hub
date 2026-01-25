FROM oven/bun:slim

RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

RUN ln -s /usr/local/bin/bun /usr/local/bin/node
ENV PATH="/home/node/.bun/bin:${PATH}"

WORKDIR /workspace/frontend
RUN chown -R bun:bun /workspace/frontend

USER bun