/**
 * Analyze API base URL — environment-aware for Vite dev vs production (Vercel).
 * - Empty `VITE_API_URL`: use `/analyze` so Vite dev proxy (see vite.config.js) handles the hop.
 * - Set `VITE_API_URL`: use absolute origin (e.g. Render HTTPS URL); no proxy in production static build.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

export const MISSIONS_SAVE_URL = API_BASE_URL ? `${API_BASE_URL}/api/missions` : '/missions'

export function missionReplaceUrl(id) {
  const enc = encodeURIComponent(id)
  return API_BASE_URL ? `${API_BASE_URL}/api/missions/${enc}` : `/api/missions/${enc}`
}
