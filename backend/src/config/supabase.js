import { createClient } from '@supabase/supabase-js'

/** Single service-role client per process — avoids extra handshakes on Render under load. */
let cachedClient = null

export function getSupabaseClient() {
  if (cachedClient) return cachedClient

  const url = process.env.SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Copy backend/.env.example to backend/.env and set them.'
    )
  }

  cachedClient = createClient(url, serviceKey, {
    auth: { persistSession: false }
  })

  return cachedClient
}
