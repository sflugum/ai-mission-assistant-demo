import { getGeminiEnv } from '../config/gemini.js'
import { parseAndValidateRaw } from '../utils/parser.js'

function buildPrimaryPrompt(input) {
  return `You are a senior analyst.

User input:
"${input}"

Return ONLY valid JSON:
{
  "actionPlan": [],
  "risks": [],
  "tools": []
}

You MUST output valid JSON with keys exactly: actionPlan, risks, tools.
Each value must be an array of strings.
Do not include any additional keys.
Do not use 'plan'.
No markdown.
No explanation.
Only JSON.
Any deviation from schema is invalid.`
}

function buildRepairPrompt(input, previousRawResponse) {
  return `Your previous response was invalid.

User input:
"${input}"

Previous invalid response:
${previousRawResponse ?? ''}

You MUST output ONLY valid JSON with exactly these keys:
actionPlan, risks, tools

Rules:
- All values must be arrays of strings
- No markdown
- No explanations
- No extra keys
- No "plan" field

Return corrected response only.`
}

async function callGemini(apiKey, model, prompt) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`

  const apiResponse = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }]
        }
      ],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json'
      }
    })
  })

  const data = await apiResponse.json().catch(() => ({}))

  if (!apiResponse.ok) {
    const msg =
      data?.error?.message ||
      `Google API request failed with status ${apiResponse.status}`
    throw new Error(msg)
  }

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    throw new Error('Invalid Gemini response: missing output text')
  }

  return text
}

export async function generateAnalysisWithGemini(input) {
  const { apiKey, model } = getGeminiEnv()
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_API_KEY. Copy backend/.env.example to backend/.env and set it.'
    )
  }

  const primaryPrompt = buildPrimaryPrompt(input)

  const firstRawResponse = await callGemini(apiKey, model, primaryPrompt)
  try {
    return parseAndValidateRaw(firstRawResponse)
  } catch (firstAttemptError) {
    console.warn(
      '[AI VALIDATION FAILED] First attempt failed:',
      firstAttemptError?.message || firstAttemptError
    )
    console.warn('[AI VALIDATION FAILED] Retrying once...')

    const repairPrompt = buildRepairPrompt(input, firstRawResponse)
    const retryRawResponse = await callGemini(apiKey, model, repairPrompt)
    console.warn('[AI RETRY RESULT]', retryRawResponse)

    try {
      const repaired = parseAndValidateRaw(retryRawResponse)
      console.warn('[AI RETRY RESULT] Success')
      return repaired
    } catch (retryError) {
      console.warn(
        '[AI RETRY RESULT] Failed:',
        retryError?.message || retryError
      )
      const finalError = new Error('AI response failed validation after retry')
      finalError.code = 'AI_VALIDATION_RETRY_FAILED'
      throw finalError
    }
  }
}
