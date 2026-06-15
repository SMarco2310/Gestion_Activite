# Docker cleanup for the Jenkins CI/CD pipeline

Date: 2026-06-15

Goal: drop Docker artifacts not needed by the Jenkins CI/CD pipeline. Jenkins
builds the production container images (server + client) and deploys them, so
the **image build** files stay and the **local-developer convenience** stack is
removed.

---

## Removed

### `docker-compose.dev.yml`

A hot-reload **local development** stack. Purely a developer-machine convenience
— it was never part of building or deploying images, so Jenkins has no use for
it. Detail of what each part did:

| Block | What it did | Why irrelevant to CI/CD |
|-------|-------------|-------------------------|
| `services.postgres` | Spun up `postgres:16-alpine` on host port `5432`, seeded the schema from `server/sql/init.up.sql` (mounted into `/docker-entrypoint-initdb.d`), with a `pg_isready` healthcheck. | CI uses its own DB (or a pipeline-provisioned service); this was a throwaway local DB for `pnpm dev`. |
| `services.app` | Ran a raw `node:22-alpine` container that did `corepack enable && pnpm install --frozen-lockfile && pnpm dev` — i.e. ts-node-dev (API) + Vite (client) with **live reload**. | Dev servers, not a production artifact. Jenkins builds compiled images, never runs `pnpm dev`. |
| `app` bind mount `./:/repo` | Mounted the **host working tree** into the container so file edits reload instantly. | Live source mounting is the opposite of an immutable CI build. |
| Anonymous volumes `root_/shared_/server_/client_node_modules` | Kept container-built (Alpine/musl) `node_modules` separate from the host's, so host and container deps didn't clobber each other. | Only needed because of the source bind mount above; no bind mount → not needed. |
| `app.environment` (`NODE_ENV=development`, `VITE_PROXY_TARGET`, `APP_URL=http://localhost:5173`, `FORCE_HTTPS=false`, etc.) | Wired the client Vite dev server (`:5173`) to proxy `/api` to the API (`:3001`) for local work. | Development URLs/ports; production uses the nginx-served build instead. |
| `ports 3001 / 5173` | Exposed API and Vite dev server to the host browser. | Vite dev server doesn't exist in production; nginx serves the built SPA. |

**Net effect of removal:** none on CI/CD or production. Developers who relied on
the one-command containerized dev stack should instead run Postgres locally (see
project memory / `server/.env`) and `pnpm dev` from the repo root — the same
workflow the file automated.

---

## Kept (and why CI/CD needs them)

| File | Role in the Jenkins pipeline |
|------|------------------------------|
| `server/Dockerfile` | Multi-stage build of the API production image: installs deps frozen, builds `@gestiactivites/shared` then `server`, runs `pnpm --filter server deploy --prod /app` for a self-contained bundle, drops to a non-root `app` user, `CMD node dist/index.js`. This is the **build artifact Jenkins produces and pushes**. |
| `client/Dockerfile` | Multi-stage build of the SPA image: builds `shared` + `client` with Vite, then serves the static `dist` via `nginx:alpine`. Second build artifact for Jenkins. |
| `client/nginx.conf` | Consumed by `client/Dockerfile` at runtime — gzip, `/api/` reverse-proxy to the `server` container, and SPA `try_files` fallback. Required for the client image to function. |
| `.dockerignore` | Trims the build context (`node_modules`, `dist`, `.env*`, `.git`, compose files, Dockerfiles) so image builds are smaller, faster, and don't leak secrets. Applies to every `docker build` Jenkins runs. |
| `docker-compose.yml` | Prod-style stack (postgres + API + nginx SPA). Retained for deploy targets / integration smoke tests that bring the full stack up from the built images. Not a build input, but useful to the pipeline's deploy or test stage. |

---

## Summary

- **Deleted:** `docker-compose.dev.yml` (local hot-reload dev only).
- **Retained:** `server/Dockerfile`, `client/Dockerfile`, `client/nginx.conf`,
  `.dockerignore`, `docker-compose.yml`.
- **Pipeline impact:** none — only a developer-convenience file was removed.
