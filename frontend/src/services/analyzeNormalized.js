import { analyzeMission } from './aiService.js'

/** Maps API JSON to the three lists the UI expects (warns if legacy `plan` appears). */
export function normalizeAnalyzeResponse(data) {
  return {
    actionPlan: data.actionPlan,
    risks: data.risks,
    tools: data.tools
  }
}

/** POST /analyze and return validated actionPlan/risks/tools. */
export async function analyzeMissionNormalized(input) {
  const data = await analyzeMission(input)

  if ('plan' in data) {
    // eslint-disable-next-line no-console
    console.warn("[DEPRECATION] backend still sending legacy 'plan' field")
  }

  const normalized = normalizeAnalyzeResponse(data)

  const isFullResponse =
    Array.isArray(normalized.actionPlan) &&
    Array.isArray(normalized.risks) &&
    Array.isArray(normalized.tools)

  if (!isFullResponse) {
    throw new Error('Invalid API response: missing actionPlan')
  }

  return normalized
}
