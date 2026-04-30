function extractJsonObject(text) {
  if (typeof text !== 'string') return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

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
  console.log('[AI RESPONSE RAW]', rawResponse)
  const jsonText = extractJsonObject(rawResponse)
  if (!jsonText) {
    throw new Error('AI output did not contain a valid JSON object.')
  }

  const parsed = JSON.parse(jsonText)
  console.log('[AI RESPONSE PARSED]', parsed)
  if ('plan' in parsed) {
    console.error("[CRITICAL] Legacy 'plan' field detected — migration incomplete")
  }

  const normalizedResponse = {
    actionPlan: parsed?.actionPlan,
    risks: parsed?.risks,
    tools: parsed?.tools
  }
  validateAIResponse(normalizedResponse)
  return normalizedResponse
}
