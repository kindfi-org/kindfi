# -----------------------------
# 1️⃣ Base Image
# -----------------------------
FROM oven/bun:1 AS base
WORKDIR /home/bun/app

# -----------------------------
# 2️⃣ Install Stage (Development)
# -----------------------------
FROM base AS install
# create temp directory for caching installs
RUN mkdir -p /temp/dev
COPY bun.lock* package.json /temp/dev/
# Copy workspace package manifests
COPY packages /temp/dev/packages
COPY services /temp/dev/services
COPY apps/kyc-server/package.json /temp/dev/apps/kyc-server/package.json
WORKDIR /temp/dev
RUN bun install --frozen-lockfile

# -----------------------------
# 3️⃣ Install Stage (Production)
# -----------------------------
FROM base AS install-prod
RUN mkdir -p /temp/prod
COPY bun.lock* package.json /temp/prod/
COPY packages /temp/prod/packages
COPY services /temp/prod/services
COPY apps/kyc-server/package.json /temp/prod/apps/kyc-server/package.json
WORKDIR /temp/prod
RUN bun install --frozen-lockfile --production

# -----------------------------
# 4️⃣ Pre-release Build
# -----------------------------
FROM base AS prerelease
WORKDIR /home/bun/app

# copy node_modules from dev install
COPY --from=install /temp/dev/node_modules ./node_modules
# copy source files
COPY . .

# handle .env (optional)
RUN if [ -f "./.env" ]; then \
      echo "Copying .env to ./apps/kyc-server/.env"; \
      cp "./.env" "./apps/kyc-server/.env"; \
    else \
      echo ".env missing or ignored"; \
    fi

# build the app
WORKDIR /home/bun/app/apps/kyc-server
ENV NODE_ENV=production
RUN bun run build

# -----------------------------
# 5️⃣ Release Image (final)
# -----------------------------
FROM oven/bun:1 AS release
WORKDIR /home/bun/app/apps/kyc-server

# copy production node_modules
COPY --from=install-prod /temp/prod/node_modules ./node_modules

# copy built app
COPY --from=prerelease /home/bun/app/apps/kyc-server/dist ./dist
COPY --from=prerelease /home/bun/app/apps/kyc-server/package.json ./package.json

# copy other assets if needed
COPY --from=prerelease /home/bun/app/apps/kyc-server/.env ./.env

# set permissions
USER bun

# expose and run
EXPOSE 3001
CMD ["bun", "start"]
