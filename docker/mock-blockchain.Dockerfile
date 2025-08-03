# Dockerfile for Mock Blockchain Services
FROM oven/bun:1.2.0-alpine AS base

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apk add --no-cache \
    curl \
    git \
    && rm -rf /var/cache/apk/*

# Copy package files
COPY package.json bun.lockb ./
COPY apps/web/package.json ./apps/web/

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY apps/web ./apps/web
COPY apps/web/lib/services/blockchain ./apps/web/lib/services/blockchain
COPY apps/web/lib/types/blockchain ./apps/web/lib/types/blockchain

# Create mock blockchain server entry point
COPY docker/mock-blockchain-server.ts ./

# Build the application
RUN cd apps/web && bun run build

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:3001/health || exit 1

# Start the mock blockchain server
CMD ["bun", "run", "mock-blockchain-server.ts"]
