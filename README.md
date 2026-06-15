# GestiActivités

![CI](https://github.com/SMarco2310/Gestion_Activite/actions/workflows/ci.yml/badge.svg)

Plateforme de gestion des activités institutionnelles — Ministère de la Santé et de l'Hygiène Publique, République Togolaise.

## Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Express 5 + TypeScript |
| Database | PostgreSQL via Supabase + Prisma ORM |
| Auth | JWT + bcrypt + email verification |
| File storage | Supabase Storage |
| AI extraction | Claude Haiku (Anthropic SDK) |
| Email | Resend |
| Error tracking | Sentry (client + server) |
| Logging | Winston + Morgan + winston-daily-rotate-file |
| Process manager | PM2 (cluster mode) |
| Monorepo | pnpm workspaces |

## Project structure

```
gestiactivites/
├── shared/          — TypeScript types + Zod schemas (shared by client + server)
├── client/          — React app (Vite)
└── server/          — Express API
```

## Getting started

```bash
# 1. Install dependencies
pnpm install

# 2. Copy env file and fill in your values
cp .env.example server/.env
cp .env.example client/.env.local

# 3. Start local PostgreSQL (Docker)
docker-compose up -d

# 4. Run database migrations
cd server && pnpm db:migrate

# 5. Start dev servers (both client + server)
pnpm dev
```

## Production deployment

```bash
# Build
pnpm build

# Start with PM2
cd server && pnpm start:pm2

# Zero-downtime reload after deploy
cd server && pnpm reload:pm2

# Monitor processes
pm2 monit

# View logs
pm2 logs gestiactivites-api
```

## Environment variables

See `.env.example` for all required variables.
