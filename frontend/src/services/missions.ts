import type { SupabaseClient } from '@supabase/supabase-js'

export type SavedMissionRow = {
  id: string
  title: string
  status: string
  updated_at: string
}

export async function fetchSavedMissions(client: SupabaseClient | null): Promise<{
  data: SavedMissionRow[]
  error: Error | null
}> {
  if (!client) {
    return { data: [], error: null }
  }

  const { data, error } = await client
    .from('missions')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })

  if (error) {
    return { data: [], error: new Error(error.message) }
  }

  return { data: (data ?? []) as SavedMissionRow[], error: null }
}

export async function fetchMissionById(
  client: SupabaseClient | null,
  id: string
): Promise<{ description: string | null; title: string | null; error: Error | null }> {
  if (!client) {
    return { description: null, title: null, error: new Error('Supabase is not configured') }
  }

  const { data, error } = await client
    .from('missions')
    .select('title, description')
    .eq('id', id)
    .maybeSingle()

  if (error) {
    return { description: null, title: null, error: new Error(error.message) }
  }

  if (!data) {
    return { description: null, title: null, error: new Error('Mission not found') }
  }

  return {
    description: typeof data.description === 'string' ? data.description : null,
    title: typeof data.title === 'string' ? data.title : null,
    error: null
  }
}
