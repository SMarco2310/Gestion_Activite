# GestiActivités — CLAUDE.md

## What this project is
Activity scheduling platform for the Ministère de la Santé du Togo.
Department heads submit activities (workshops, missions, training). The system detects when the same participant is scheduled for two overlapping activities and flags it as a conflict for resolution.

## Commands
- Start dev servers: pnpm dev (from root — runs client + server concurrently)
- Install all packages: pnpm install (from root)
- DB migrate: cd server && pnpm db:migrate
- DB generate: cd server && pnpm db:generate
- DB studio: cd server && pnpm db:studio
- Type check: pnpm typecheck (from root)
- Build: pnpm build (from root)

## Architecture — IMPORTANT
- Monorepo: shared/ client/ server/ linked via pnpm workspaces
- shared/ package exports all TypeScript types AND Zod schemas — import from '@gestiactivites/shared' in both client and server. NEVER duplicate types.
- Routes → Controllers → Services → Prisma. Controllers never touch Prisma directly.
- All business logic lives in server/src/services/. Controllers only handle HTTP in/out.
- One Prisma client instance: server/src/lib/prisma.ts. Never instantiate PrismaClient elsewhere.

## Code rules
- TypeScript everywhere — no plain JS files, no `any` types
- All API request bodies validated with Zod via validate.middleware.ts before hitting the controller
- All controllers wrapped in try/catch — errors passed to global error handler, never leaked raw to client
- Use logger (Winston) instead of console.log on the server — import from server/src/lib/logger.ts
- French for all user-facing strings. English for code, comments, variable names.
- camelCase for variables/functions, PascalCase for components/types, kebab-case for filenames

## Key decisions already locked — do not change
- Participants stored as name strings, NOT foreign keys to users table. Prevents blocking manual replacements.
- Conflict detection runs inside a Prisma $transaction on every activity submit/update
- Auth is stateless JWT — token in localStorage, sent as Bearer header, no server-side session store
- Government email validation happens server-side in the API route, not just client-side
- Activities are never hard-deleted — status set to 'archive' (soft delete)
- AI extraction output is always shown to user for review before saving — never auto-saved

## Env vars (required in server/.env)
DATABASE_URL, SUPABASE_URL, SUPABASE_SERVICE_KEY, SUPABASE_STORAGE_BUCKET,
JWT_SECRET, JWT_EXPIRES_IN, RESEND_API_KEY, EMAIL_FROM,
APP_URL, API_URL, PORT, NODE_ENV, ANTHROPIC_API_KEY, SENTRY_DSN

## Testing approach
After implementing each feature, verify with:
1. TypeScript type-check passes: pnpm typecheck
2. The relevant API endpoint responds correctly (use curl or the running client)
3. No errors in the Winston log output

## Do not
- Do not use console.log on the server — use logger
- Do not install new packages without confirming first
- Do not change the Prisma schema without discussing it
- Do not hardcode any URL, key, or config — use process.env
- Do not duplicate types that exist in shared/