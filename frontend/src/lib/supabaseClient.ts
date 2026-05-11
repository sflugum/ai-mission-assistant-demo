import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cached: SupabaseClient | null = null

/**
 * Browser Supabase with the **anon** key only (RLS applies). Returns null if env is unset so the app can still boot for static/demo routes.
 */
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
