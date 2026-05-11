import type { SupabaseClient } from '@supabase/supabase-js'

export type SavedMissionRow = {
  id: string
  title: string
  status: string
  /** `updated_at` when that column exists, else falls back to `created_at`. */
  lastActivityAt: string
}

export async function fetchSavedMissions(client: SupabaseClient | null): Promise<{
  data: SavedMissionRow[]
  error: Error | null
}> {
  if (!client) {
    return { data: [], error: null }
  }

  const withUpdated = await client
    .from('missions')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false })

  if (!withUpdated.error) {
    return {
      data: (withUpdated.data ?? []).map(
        (row: { id: string; title: string; status: string; updated_at: string }) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          lastActivityAt: row.updated_at
        })
      ),
      error: null
    }
  }

  const msg = withUpdated.error?.message ?? ''
  if (/updated_at|schema cache/i.test(msg)) {
    const legacy = await client
      .from('missions')
      .select('id, title, status, created_at')
      .order('created_at', { ascending: false })

    if (legacy.error) {
      return { data: [], error: new Error(legacy.error.message) }
    }

    return {
      data: (legacy.data ?? []).map(
        (row: { id: string; title: string; status: string; created_at: string }) => ({
          id: row.id,
          title: row.title,
          status: row.status,
          lastActivityAt: row.created_at
        })
      ),
      error: null
    }
  }

  return { data: [], error: new Error(msg || 'Failed to load missions') }
}

export async function deleteSavedMission(
  client: SupabaseClient | null,
  id: string
): Promise<{ error: Error | null }> {
  if (!client) {
    return { error: new Error('Supabase is not configured') }
  }

  const { error } = await client.from('missions').delete().eq('id', id)

  if (error) {
    return { error: new Error(error.message) }
  }

  return { error: null }
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
