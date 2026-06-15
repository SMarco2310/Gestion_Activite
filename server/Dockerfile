# ── Build stage ─────────────────────────────────────────────────────
# Build context is the repo root (monorepo): docker build -f server/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

# Install deps (cached on manifest changes only)
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json shared/
COPY server/package.json server/
RUN pnpm install --frozen-lockfile

# Build shared (to JS) then server
COPY shared ./shared
COPY server ./server
RUN pnpm --filter @gestiactivites/shared build \
 && pnpm --filter server build

# Produce a self-contained prod bundle (prod deps + built dist + injected shared)
RUN pnpm --filter server deploy --prod /app

# ── Runtime stage ───────────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3001
# Drop root
RUN addgroup -S app && adduser -S app -G app
COPY --from=build --chown=app:app /app ./
USER app
EXPOSE 3001
CMD ["node", "dist/index.js"]
