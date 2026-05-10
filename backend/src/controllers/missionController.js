import { getSupabaseClient } from '../config/supabase.js'
import { generateAnalysisWithGemini } from '../services/geminiService.js'
import { validateAIResponse } from '../utils/parser.js'

const TITLE_MAX_LENGTH = 80

function buildTitle(input) {
  if (input.length <= TITLE_MAX_LENGTH) return input
  return `${input.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
}

export async function analyzeMission(req, res) {
  console.log('LOGGING FROM CONTROLLER')
  console.log('HIT /analyze')
  try {
    const input = req?.body?.input
    if (typeof input !== 'string' || input.trim().length === 0) {
      return res.status(400).json({ error: 'input must be a non-empty string' })
    }

    const trimmedInput = input.trim()
    const analysis = await generateAnalysisWithGemini(trimmedInput)
    validateAIResponse(analysis)

    const supabase = getSupabaseClient()
    const { data: mission, error: dbError } = await supabase
      .from('missions')
      .insert({
        title: buildTitle(trimmedInput),
        description: trimmedInput
      })
      .select('id')
      .single()

    if (dbError) {
      throw new Error(`Failed to persist mission: ${dbError.message}`)
    }

    return res.json({ missionId: mission.id, ...analysis })
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
