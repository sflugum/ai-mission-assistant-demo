const trimmed = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const API_BASE_URL =
  trimmed || (import.meta.env.DEV ? 'http://localhost:3001' : '')

const ANALYZE_URL = API_BASE_URL ? `${API_BASE_URL}/analyze` : '/analyze'

/**
 * POST mission text to the Express `/analyze` endpoint.
 * @param {string} input
 * @returns {Promise<object>}
 */
export async function analyzeMission(input) {
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(text ? `Request failed: ${text}` : `Request failed: ${res.status}`)
  }

  return res.json()
}
