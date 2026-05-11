import { ANALYZE_URL } from '../api/config.js'

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
    let message = `Request failed: ${res.status}`
    if (text) {
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
