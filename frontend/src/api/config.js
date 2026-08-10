/**
 * API configuration for environment-aware routing (Vite local dev vs Production/Vercel).
 *
 * - Local Dev (VITE_API_URL empty): API_BASE_URL is '', so endpoints evaluate to relative
 *   paths like '/api/missions'. Run with `vercel dev`; requests to /api/missions reach the
 *   local Express backend on :3001, while /api/generate-plan is served directly by Vercel's
 *   own serverless runtime (it's a co-located function under frontend/api/, so it never
 *   touches Express or Vite's dev server).
 * - Production (VITE_API_URL set to Render URL): API_BASE_URL prepends the full origin (e.g. https://your-backend.onrender.com).
 */
export const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')

// Both endpoints always prefix with API_BASE_URL and include /api. 
// No separate empty-string branch, so there's only one path to keep in sync if this changes.
export const MISSIONS_SAVE_URL = `${API_BASE_URL}/api/missions`

export function missionReplaceUrl(id) {
  const enc = encodeURIComponent(id)
  return `${API_BASE_URL}/api/missions/${enc}`
}
