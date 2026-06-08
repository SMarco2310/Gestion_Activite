import 'dotenv/config'
import app from './app'
import logger from './lib/logger'
import { pool } from './lib/db'

const PORT = parseInt(process.env.PORT || '3001', 10)

async function main() {
  try {
    await pool.query('SELECT 1')
    logger.info('Database connected')

    app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        env: process.env.NODE_ENV,
        port: PORT,
      })
    })
  } catch (error) {
    logger.error('Failed to start server', { error })
    process.exit(1)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down gracefully')
  await pool.end()
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received — shutting down gracefully')
  await pool.end()
  process.exit(0)
})

main()
