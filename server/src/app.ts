import express from 'express'
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

const app = express()

// ─── Security middleware ───────────────────────────────────────────
app.use(helmet())
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
