#!/usr/bin/env bash

# Production start script for Elest.io deployment
# Ensures proper environment variables and starts the server

set -euo pipefail

log() { printf "[start-server] %s\n" "$*"; }

# Set default PORT if not provided
export PORT="${PORT:-3001}"
export NODE_ENV="${NODE_ENV:-production}"

log "Starting KYC server on port $PORT in $NODE_ENV mode..."

# Check if the built server exists
if [ ! -f "dist/index.js" ]; then
  log "ERROR: dist/index.js not found. Did you run 'bun run build'?"
  exit 1
fi

# Start the server
bun start
