ARG NODE_VERSION=24.13.0
FROM node:${NODE_VERSION}-slim AS base

# This Dockerfile is copy-pasted into our main docs at /docs/handbook/deploying-with-docker.
# Make sure you update both files!

# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN corepack enable
# Set working directory
WORKDIR /app

# ---
FROM base AS prepare
# Use pnpm via Corepack and run turbo without global install
COPY . .
# Add lockfile and package.json's of isolated subworkspace
RUN pnpm dlx turbo prune web --docker

# ---
FROM base AS deps

# Copy only dependency-related files
COPY --from=prepare /app/out/json/ ./

# Use BuildKit cache for pnpm store
RUN --mount=type=cache,id=pnpm-store,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile

# ---
FROM base AS builder
# First install the dependencies (as they change less often)
# COPY --from=prepare /app/out/json/ .
# RUN pnpm install --frozen-lockfile

# Reuse node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=deps /app/package.json ./package.json

# Build the project via the full pruned workspace
COPY --from=prepare /app/out/full/ .

# Uncomment and use build args to enable remote caching
# ARG TURBO_TEAM
# ENV TURBO_TEAM=$TURBO_TEAM

# ARG TURBO_TOKEN
# ENV TURBO_TOKEN=$TURBO_TOKEN

RUN pnpm turbo build

# ---
FROM node:${NODE_VERSION}-alpine AS runner

# Enable Corepack in runtime image as well (optional but safe)
RUN corepack enable

# Don't run production as root for security reasons
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public ./apps/web/public

CMD ["node", "apps/web/server.js"]
