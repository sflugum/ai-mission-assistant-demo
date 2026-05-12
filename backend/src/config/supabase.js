import { createClient } from '@supabase/supabase-js'
import { HttpError } from '../middleware/errorMiddleware.js'

/** Single service-role client per process — avoids extra handshakes on Render under load. */
let cachedClient = null

export function getSupabaseClient() {
  if (cachedClient) return cachedClient

  const url = (process.env.SUPABASE_URL ?? '').trim()
  const serviceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()

  if (!url || !serviceKey) {
    throw new HttpError(
      503,
      'Database is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server (trimmed values must be non-empty).'
    )
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false }
  })

  return cachedClient
}
