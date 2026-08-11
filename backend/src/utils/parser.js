/**
 * @param {string} text
 * @returns {string | null} the substring from the first `{` to the last `}`,
 * or null if it can't find both. Handles cases where the model wraps its
 * JSON in prose or a markdown code fence instead of returning raw JSON.
 */
function extractJsonObject(text) {
  if (typeof text !== 'string') return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

/**
 * Checks the parsed AI response has exactly the three expected fields, each
 * an array. Rejecting unknown keys (rather than just ignoring them) helps
 * catch cases where the model drifted from the expected schema instead of
 * silently passing malformed data downstream.
 */
export function validateAIResponse(data) {
  if (!data) throw new Error('Empty AI response')

  const requiredFields = ['actionPlan', 'risks', 'tools']
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Invalid AI response: missing ${field}`)
    }

    if (!Array.isArray(data[field])) {
      throw new Error(`Invalid AI response: ${field} must be an array`)
    }
  }

  const allowedFields = new Set(requiredFields)
  for (const key of Object.keys(data)) {
    if (!allowedFields.has(key)) {
      throw new Error(`Invalid AI response: unexpected key ${key}`)
    }
  }

  return true
}

export function parseAndValidateRaw(rawResponse) {
  const jsonText = extractJsonObject(rawResponse)
  if (!jsonText) {
    throw new Error('AI output did not contain a valid JSON object.')
  }

  const parsed = JSON.parse(jsonText)

  const normalizedResponse = {
    actionPlan: parsed?.actionPlan,
    risks: parsed?.risks,
    tools: parsed?.tools
  }
  validateAIResponse(normalizedResponse)
  return normalizedResponse
}
