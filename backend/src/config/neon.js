import pg from 'pg'
import { HttpError } from '../middleware/errorMiddleware.js'

const { Pool } = pg

let pool = null

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
    console.error('Unexpected error on idle database client', err)
    process.exit(-1)
  })

  return pool
}

export const query = (text, params) => getNeonPool().query(text, params)