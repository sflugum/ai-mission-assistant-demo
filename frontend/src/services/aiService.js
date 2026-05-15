import { ANALYZE_URL } from '../api/config.js'

/**
 * POST mission text to Express `/analyze`.
 * URL comes from `../api/config.js` (relative in dev → Vite proxy; absolute when `VITE_API_URL` is set).
 */
export async function analyzeMission(input) {
  const res = await fetch(ANALYZE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ input })
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    let message = `Request failed: ${res.status}`
    if (res.status === 502) {
      message =
        'Cannot reach the API server (502). Start the backend (e.g. `npm run dev` in backend/ or `docker compose up`), then retry. If the backend bound to a different port, restart Vite after it writes frontend/.port_config.json.'
    }
    if (text && res.status !== 502) {
      try {
        const body = JSON.parse(text)
        if (body && typeof body.message === 'string' && body.message.length > 0) {
          message = body.message
        } else {
          message = text
        }
      } catch {
        message = text
      }
    }
    throw new Error(message)
  }

  return res.json()
}
