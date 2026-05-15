import { analyzeMission } from './aiService.js'

/** Maps API JSON to the three lists the UI expects. */
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
