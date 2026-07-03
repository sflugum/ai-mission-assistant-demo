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

const emptyDetail: MissionDetail = {
  description: null,
  title: null,
  actionPlan: [],
  risks: [],
  tools: [],
  error: null
}

export async function fetchSavedMissions(): Promise<{
  data: SavedMissionRow[]
  error: Error | null
}> {
  try {
    const res = await fetch('/missions')
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Failed to fetch: ${res.status}`)
    }
    const data = await res.json()
    
    const mapped = data.map((row: any) => ({
      id: row.id,
      title: row.title,
      status: row.status,
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

export async function deleteSavedMission(id: string): Promise<{ error: Error | null }> {
  try {
    const res = await fetch(`/missions/${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const text = await res.text()
      throw new Error(text || `Failed to delete: ${res.status}`)
    }
    return { error: null }
  } catch (err) {
    return { error: err instanceof Error ? err : new Error('Failed to delete mission') }
  }
}

export async function fetchMissionById(id: string): Promise<MissionDetail> {
  try {
    const res = await fetch(`/missions/${id}`)
    if (!res.ok) {
      if (res.status === 404) return { ...emptyDetail, error: new Error('Mission not found') }
      const text = await res.text()
      throw new Error(text || `Failed to fetch: ${res.status}`)
    }
    
    const data = await res.json()
    return { ...emptyDetail, ...data }
  } catch (err) {
    return { ...emptyDetail, error: err instanceof Error ? err : new Error('Failed to load mission') }
  }
}