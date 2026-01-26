#!/usr/bin/env bash
set -e

# Azure App Service sets PORT automatically
PORT="${PORT:-8002}"

exec uvicorn backend.main:app \
  --host 0.0.0.0 \
  --port "$PORT"
