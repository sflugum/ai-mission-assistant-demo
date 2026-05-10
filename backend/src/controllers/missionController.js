import { getSupabaseClient } from '../config/supabase.js'
import { generateAnalysisWithGemini } from '../services/geminiService.js'
import { validateAIResponse } from '../utils/parser.js'
import { HttpError } from '../middleware/errorMiddleware.js'

const TITLE_MAX_LENGTH = 80

function buildTitle(input) {
  if (input.length <= TITLE_MAX_LENGTH) return input
  return `${input.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
}

export async function analyzeMission(req, res) {
  const input = req?.body?.input
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new HttpError(400, 'input must be a non-empty string')
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
}
