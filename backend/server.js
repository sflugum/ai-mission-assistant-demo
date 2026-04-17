import 'dotenv/config'
import express from 'express'
import cors from 'cors'

// Nodemon does not reload .env on change — restart the server after editing backend/.env.

const app = express()
const allowedOrigins = [
  'http://localhost:5173',
  'https://ai-mission-assistant-demo.vercel.app'
]

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true)
      if (allowedOrigins.includes(origin)) return callback(null, true)
      return callback(new Error('Not allowed by CORS'))
    }
  })
)
app.use(express.json({ limit: '1mb' }))

function extractJsonObject(text) {
  if (typeof text !== 'string') return null
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

function validateAIResponse(data) {
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
        temperature: 0.2
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

  return data?.candidates?.[0]?.content?.parts?.[0]?.text
}

function parseAndValidateRaw(rawResponse) {
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

async function generateAnalysisWithGemini(input) {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_API_KEY. Copy backend/.env.example to backend/.env and set it.'
    )
  }

  const model = process.env.GOOGLE_MODEL || 'gemini-2.5-flash'
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

app.post('/analyze', async (req, res) => {
  try {
    const input = req?.body?.input
    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: 'input must be a non-empty string' })
    }

    const analysis = await generateAnalysisWithGemini(input.trim())
    validateAIResponse(analysis)
    return res.json(analysis)
  } catch (err) {
    if (err?.code === 'AI_VALIDATION_RETRY_FAILED') {
      return res.status(500).json({
        error: 'AI response failed validation after retry',
        actionPlan: [],
        risks: [],
        tools: []
      })
    }

    // Frontend treats non-2xx as errors and displays res.text().
    const message = err?.message || 'Failed to analyze input.'
    return res.status(500).send(message)
  }
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  console.log('Using Gemini model:', process.env.GOOGLE_MODEL)
  // eslint-disable-next-line no-console
  console.log(`AI Mission Assistant backend listening on http://localhost:${port}`)
})

