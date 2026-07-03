export type MissionStatus = "draft" | "active" | "paused" | "completed" | "cancelled"

export interface MissionRow {
  id: string
  title: string
  status: MissionStatus
  description: string | null
  created_at: string
  updated_at: string
}

export interface MissionLineRow {
  category: string
  sort_order: number
  line_text: string
}
