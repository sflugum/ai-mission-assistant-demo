import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173'
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

function asStringArray(maybeArray) {
  if (!Array.isArray(maybeArray)) return []
  return maybeArray
    .map((v) => (typeof v === 'string' ? v : null))
    .filter(Boolean)
}

async function generateAnalysisWithGemini(input) {
  const apiKey = process.env.GOOGLE_API_KEY
  if (!apiKey) {
    throw new Error(
      'Missing GOOGLE_API_KEY. Copy backend/.env.example to backend/.env and set it.'
    )
  }

  const model = process.env.GOOGLE_MODEL || 'gemini-1.5-flash'
  const prompt = `You are a senior analyst.

User input:
"${input}"

Return ONLY valid JSON:
{
  "plan": [],
  "risks": [],
  "tools": []
}

No markdown. No explanation. Only JSON.`

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(
    model
  )}:generateContent?key=${encodeURIComponent(apiKey)}`

  const response = await fetch(url, {
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

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const msg =
      data?.error?.message ||
      `Google API request failed with status ${response.status}`
    throw new Error(msg)
  }

  const modelText = data?.candidates?.[0]?.content?.parts?.[0]?.text
  const jsonText = extractJsonObject(modelText)
  if (!jsonText) {
    throw new Error('AI output did not contain a valid JSON object.')
  }

  const parsed = JSON.parse(jsonText)
  return {
    plan: asStringArray(parsed?.plan),
    risks: asStringArray(parsed?.risks),
    tools: asStringArray(parsed?.tools)
  }
}

app.post('/analyze', async (req, res) => {
  try {
    const input = req?.body?.input
    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: 'input must be a non-empty string' })
    }

    const analysis = await generateAnalysisWithGemini(input.trim())
    return res.json(analysis)
  } catch (err) {
    // Frontend treats non-2xx as errors and displays res.text().
    const message = err?.message || 'Failed to analyze input.'
    return res.status(500).send(message)
  }
})

const port = Number(process.env.PORT || 3001)
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`AI Mission Assistant backend listening on http://localhost:${port}`)
})

