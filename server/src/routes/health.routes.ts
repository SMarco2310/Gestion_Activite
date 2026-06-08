import { Router } from 'express'
import { pool } from '../lib/db'

const router = Router()

router.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
    })
  } catch {
    res.status(503).json({ status: 'degraded', error: 'Database unreachable' })
  }
})

export default router
