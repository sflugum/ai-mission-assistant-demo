export type SavedMissionRow = {
  id: string
  title: string
  status: string
  lastActivityAt: string
}

export type MissionDetail = {
  title: string | null
  description: string | null
  actionPlan: string[]
  risks: string[]
  tools: string[]
  error: Error | null
}

// Default shape for a failed/missing mission, so callers get null/[] instead
// of undefined fields.
const emptyDetail: MissionDetail = {
  description: null,
  title: null,
  actionPlan: [],
  risks: [],
  tools: [],
  error: null
}

/**
 * Fetches the list of saved missions for the current user.
 * Returns a `{data, error}` pair instead of throwing, so callers can render
 * an error state without wrapping every call site in try/catch.
 */
export async function fetchSavedMissions(): Promise<{
  data: SavedMissionRow[]
  error: Error | null
}> {
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/missions`);
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Failed to fetch: ${res.status}`)
    }
    const data = await res.json()

    const mapped = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      status: row.status,
      // updated_at defaults to NOW() at insert (same as created_at) and only
      // changes via a trigger on an actual edit, so this rarely falls through
      // to created_at, mainly a guard against a null/missing value.
      lastActivityAt: row.updated_at || row.created_at
    }))

    return { data: mapped, error: null }
  } catch (err) {
    return {
      data: [],
      error: err instanceof Error ? err : new Error('Failed to load missions')
    }
  }
}

/**
 * Deletes a saved mission by id.
 */
export async function deleteSavedMission(id: string): Promise<{ error: Error | null }> {
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/missions/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Failed to delete: ${res.status}`)
    }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Failed to delete mission') }
  }
}

/**
 * Fetches a single mission's details by id.
 */
export async function fetchMissionById(id: string): Promise<MissionDetail> {
  try {
    const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
    const res = await fetch(`${apiUrl}/api/missions/${id}`);
    if (!res.ok) {
      // Handled separately so the caller can show "not found" instead of a
      // generic fetch-failure message.
      if (res.status === 404) return { ...emptyDetail, error: new Error('Mission not found') }
      const text = await res.text()
      throw new Error(text || `Failed to fetch: ${res.status}`)
    }

    const data = await res.json()
    // Spread over emptyDetail so a missing field comes back as null/[] instead of undefined.
    return { ...emptyDetail, ...data }
  } catch (err) {
    return { ...emptyDetail, error: err instanceof Error ? err : new Error('Failed to load mission') }
  }
}