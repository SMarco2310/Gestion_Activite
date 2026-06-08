import { Pool, PoolClient, types } from 'pg'
import logger from './logger'

// Postgres DATE (oid 1082) → keep the raw 'YYYY-MM-DD' string instead of a JS Date.
// Avoids timezone shifts when the value is serialised back to the client.
types.setTypeParser(1082, (val) => val)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.on('error', (err) => {
  logger.error('Unexpected database pool error', { error: err.message })
})

/** Run a query and return all rows. */
export async function query<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T[]> {
  const result = await pool.query(text, params)
  return result.rows as T[]
}

/** Run a query and return the first row, or null. */
export async function queryOne<T = Record<string, unknown>>(
  text: string,
  params: unknown[] = []
): Promise<T | null> {
  const rows = await query<T>(text, params)
  return rows[0] ?? null
}

/** Run a query and return the number of affected rows. */
export async function execute(text: string, params: unknown[] = []): Promise<number> {
  const result = await pool.query(text, params)
  return result.rowCount ?? 0
}

/** Run `fn` inside a BEGIN/COMMIT transaction, rolling back on error. */
export async function withTransaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    const result = await fn(client)
    await client.query('COMMIT')
    return result
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}
