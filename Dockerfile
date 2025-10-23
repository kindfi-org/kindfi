FROM oven/bun:latest

# Add a work directory
WORKDIR /app
# Copy dependencies
COPY ./check.txt ./package*.json ./bun.lock ./

COPY . .

# Install dependencies
# RUN BUN_INSTALL=1 ./apps/kyc-server/scripts/init-server-config.sh
RUN bun install --frozen-lockfile

# Copy app files
COPY . .

# Cache and Install dependencies


#.env Source destination argument
ARG source_file=./.env
ARG destination_dir=./apps/kyc-server/.env

#.env copying management
RUN if [ -f "$source_file" ]; then \
        if [ "$source_file" != "$destination_dir" ]; then \
            echo "Copying $source_file to $destination_dir"; \
            cp "$source_file" "$destination_dir"; \
        else \
            echo "Source and destination paths are the same; skipping copy."; \
        fi \
    else \
        echo ".env has been added to dockerignore; skipping copy; if you want to copy it, remove it from dockerignore."; \
    fi

# Change a work directory
WORKDIR /app/apps/kyc-server

# Expose port
EXPOSE 3001

# Build command
RUN bun install && bun run build

# Start the app
CMD bun start
