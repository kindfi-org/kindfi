FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN npm install -g bun
RUN bun install

# Copy source files
COPY tsconfig.json ./
COPY src ./src

# Build the application
RUN bun run build

# Expose the port
EXPOSE 3800

# Set environment variables with defaults
ENV PORT=3800
ENV DELAY=500
ENV ERROR_RATE=0.1

# Run the server
CMD ["node", "dist/index.js"]