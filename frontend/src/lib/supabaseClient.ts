import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/** Returns null when env is missing (anonymous / no-config browser session). */
export function getBrowserSupabase(): SupabaseClient | null {
  const url = import.meta.env.VITE_SUPABASE_URL
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  if (!url?.trim() || !anonKey?.trim()) {
    return null
  }
  if (!cached) {
    cached = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
  }
  return cached
}
