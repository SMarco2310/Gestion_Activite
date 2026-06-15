import express, { type Express } from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import morgan from 'morgan'
import { initSentry, Sentry } from './lib/sentry'
import logger from './lib/logger'

// Routes
import authRoutes from './routes/auth.routes'
import activityRoutes from './routes/activities.routes'
import participantRoutes from './routes/participants.routes'
import conflictRoutes from './routes/conflicts.routes'
import documentRoutes from './routes/documents.routes'
import notificationRoutes from './routes/notifications.routes'
import healthRoutes from './routes/health.routes'

// Init Sentry first — before everything else
initSentry()

const app: Express = express();

// Trust the first proxy hop so express-rate-limit keys on the real client IP
// (not the proxy's) when deployed behind a reverse proxy / load balancer.
app.set('trust proxy', 1)

// Force HTTPS when FORCE_HTTPS=true (set this only when TLS is terminated in
// front, e.g. behind a real reverse proxy — not for plain-HTTP compose runs).
if (process.env.FORCE_HTTPS === 'true') {
  app.use((req, res, next) => {
    if (req.secure || req.headers['x-forwarded-proto'] === 'https') return next()
    if (req.method === 'GET' || req.method === 'HEAD') {
      return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`)
    }
    return res.status(403).json({ success: false, error: 'HTTPS requis' })
  })
}

// ─── Security middleware ───────────────────────────────────────────
// HSTS: tell browsers to only use HTTPS for the next year (incl. subdomains).
app.use(helmet({
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
}))
app.use(cors({
  origin: process.env.APP_URL || 'http://localhost:5173',
  credentials: true,
}))
app.use(rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: { success: false, error: 'Trop de requêtes — réessayez dans 15 minutes' },
  skip: (req) => req.path === '/api/health',
}))

// ─── Parsing ───────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// ─── Logging ──────────────────────────────────────────────────────
app.use(morgan('combined', {
  stream: { write: (msg) => logger.info(msg.trim()) },
  skip: (req) => req.path === '/api/health', // don't log health checks
}))

// ─── Routes ───────────────────────────────────────────────────────
app.use('/api/health', healthRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/activities', activityRoutes)
app.use('/api/participants', participantRoutes)
app.use('/api/conflicts', conflictRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/notifications', notificationRoutes)

// ─── Error handlers ───────────────────────────────────────────────
app.use(Sentry.expressErrorHandler())

app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  logger.error('Unhandled error', { error: err.message, stack: err.stack })
  res.status(500).json({ success: false, error: 'Erreur interne du serveur' })
})

export default app
