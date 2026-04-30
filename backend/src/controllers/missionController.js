import { generateAnalysisWithGemini } from '../services/geminiService.js'
import { validateAIResponse } from '../utils/parser.js'

export async function analyzeMission(req, res) {
  console.log('LOGGING FROM CONTROLLER')
  console.log('HIT /analyze')
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

    const message = err?.message || 'Failed to analyze input.'
    return res.status(500).json({ error: message })
  }
}
