import type { SupabaseClient } from '@supabase/supabase-js'

export type SavedMissionRow = {
  id: string
  title: string
  status: string
  /** `updated_at` when that column exists, else falls back to `created_at`. */
  lastActivityAt: string
}

/** Lists saved missions for the selector; prefers `updated_at` when the DB has that migration. */
export async function fetchSavedMissions(client: SupabaseClient | null): Promise<{
  data: SavedMissionRow[]
  error: Error | null
}> {

  if (!client) {
    return { data: [], error: null };
  }

  const withUpdated = await client
    .from('missions')
    .select('id, title, status, updated_at')
    .order('updated_at', { ascending: false });

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
  // Older DBs without `updated_at` return a column error — fall back so the UI still loads.
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

type MissionLineRow = {
  category: string
  sort_order: number
  line_text: string
}

function groupMissionLines(rows: MissionLineRow[] | null | undefined) {
  const pick = (cat: string) =>
    (rows ?? [])
      .filter((r) => r.category === cat)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((r) => r.line_text)

  return {
    actionPlan: pick('action_plan'),
    risks: pick('risk'),
    tools: pick('tool')
  }
}

export type MissionDetail = {
  title: string | null
  description: string | null
  actionPlan: string[]
  risks: string[]
  tools: string[]
  error: Error | null
}

export async function fetchMissionById(
  client: SupabaseClient | null,
  id: string
): Promise<MissionDetail> {
  const empty: MissionDetail = {
    description: null,
    title: null,
    actionPlan: [],
    risks: [],
    tools: [],
    error: null
  }

  if (!client) {
    return { ...empty, error: new Error('Supabase is not configured') }
  }

  const nested = await client
    .from('missions')
    .select('title, description, mission_lines ( category, sort_order, line_text )')
    .eq('id', id)
    .maybeSingle()

  if (!nested.error && nested.data) {
    const raw = nested.data as {
      title: string | null
      description: string | null
      mission_lines: MissionLineRow[] | null
    }
    const { actionPlan, risks, tools } = groupMissionLines(raw.mission_lines)
    return {
      title: typeof raw.title === 'string' ? raw.title : null,
      description: typeof raw.description === 'string' ? raw.description : null,
      actionPlan,
      risks,
      tools,
      error: null
    }
  }

  const msg = nested.error?.message ?? ''
  if (/mission_lines|schema cache/i.test(msg)) {
    const legacy = await client
      .from('missions')
      .select('title, description')
      .eq('id', id)
      .maybeSingle()

    if (legacy.error) {
      return { ...empty, error: new Error(legacy.error.message) }
    }
    if (!legacy.data) {
      return { ...empty, error: new Error('Mission not found') }
    }
    const row = legacy.data as { title: string; description: string | null }
    return {
      title: typeof row.title === 'string' ? row.title : null,
      description: typeof row.description === 'string' ? row.description : null,
      actionPlan: [],
      risks: [],
      tools: [],
      error: null
    }
  }

  if (nested.error) {
    return { ...empty, error: new Error(msg || 'Failed to load mission') }
  }

  return { ...empty, error: new Error('Mission not found') }
}
