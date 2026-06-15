# ── Build stage ─────────────────────────────────────────────────────
# Build context is the repo root (monorepo): docker build -f client/Dockerfile .
FROM node:22-alpine AS build
RUN corepack enable
WORKDIR /repo

COPY pnpm-workspace.yaml package.json pnpm-lock.yaml ./
COPY shared/package.json shared/
COPY client/package.json client/
RUN pnpm install --frozen-lockfile

COPY shared ./shared
COPY client ./client
# Client imports @gestiactivites/shared → build it first, then build the SPA.
# No VITE_API_URL set → axios uses "/api", which nginx proxies to the server.
RUN pnpm --filter @gestiactivites/shared build \
 && pnpm --filter client build

# ── Runtime stage (static via nginx) ────────────────────────────────
FROM nginx:alpine AS runner
COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /repo/client/dist /usr/share/nginx/html
EXPOSE 80
