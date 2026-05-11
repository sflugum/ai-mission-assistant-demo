export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

/** Matches public.mission_status; regenerate via `npm run types:generate` at repo root (requires `supabase start`). */
export type MissionStatus =
  | 'draft'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'

export type Database = {
  public: {
    Tables: {
      missions: {
        Row: {
          id: string
          created_at: string
          title: string
          description: string | null
          status: MissionStatus
          updated_at: string
        }
        Insert: {
          id?: string
          created_at?: string
          title: string
          description?: string | null
          status?: MissionStatus
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          title?: string
          description?: string | null
          status?: MissionStatus
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      mission_status: MissionStatus
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
