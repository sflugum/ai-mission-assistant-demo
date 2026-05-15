import { MISSIONS_SAVE_URL, missionReplaceUrl } from '../api/config.js'

function augmentSaveErrorMessage(msg) {
  if (
    typeof msg === 'string' &&
    /mission_lines|schema cache/i.test(msg)
  ) {
    return `${msg} Apply Supabase migrations (for example \`supabase db push\` against the database your backend uses) so public.mission_lines exists.`
  }
  return msg
}

async function readErrorMessage(res) {
  const text = await res.text().catch(() => '')
  if (!text) return `Request failed: ${res.status}`
  try {
    const body = JSON.parse(text)
    if (body && typeof body.message === 'string' && body.message.length > 0) {
      return body.message
    }
    return text
  } catch {
    return text
  }
}

/**
 * @param {{ description: string, title?: string, actionPlan: string[], risks: string[], tools: string[] }} payload
 * @returns {Promise<{ missionId: string }>}
 */
export async function createMissionPersist(payload) {
  const res = await fetch(MISSIONS_SAVE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(augmentSaveErrorMessage(await readErrorMessage(res)))
  }
  return res.json()
}

/**
 * @param {string} missionId
 * @param {{ description: string, title?: string, actionPlan: string[], risks: string[], tools: string[] }} payload
 * @returns {Promise<{ missionId: string }>}
 */
export async function replaceMissionPersist(missionId, payload) {
  const res = await fetch(missionReplaceUrl(missionId), {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  if (!res.ok) {
    throw new Error(augmentSaveErrorMessage(await readErrorMessage(res)))
  }
  return res.json()
}
