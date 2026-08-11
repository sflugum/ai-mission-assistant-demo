import pg from 'pg'
import { HttpError } from '../middleware/errorMiddleware.js'

const { Pool } = pg

// Module-level singleton so every import shares one connection pool instead
// of each caller creating its own.
let pool = null

/**
 * Lazily creates the Postgres pool on first use and reuses it after that.
 */
export function getNeonPool() {
  if (pool) return pool

  const connectionString = (process.env.DATABASE_URL ?? '').trim()

  if (!connectionString) {
    throw new HttpError(
      503,
      'Database is not configured: set DATABASE_URL on the server.'
    )
  }

  pool = new Pool({
    connectionString,
    ssl: {
      rejectUnauthorized: false // Neon requires SSL
    }
  })

  pool.on('error', (err) => {
    // An idle client throwing usually means the pool is in a bad state.
    // Exiting and letting the process manager restart it is safer than
    // continuing to serve requests against a pool that might be broken.
    console.error('Unexpected error on idle database client', err)
    process.exit(-1)
  })

  return pool
}

export const query = (text, params) => getNeonPool().query(text, params)