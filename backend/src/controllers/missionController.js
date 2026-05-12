import { getSupabaseClient } from '../config/supabase.js'
import { generateAnalysisWithGemini } from '../services/geminiService.js'
import { validateAIResponse } from '../utils/parser.js'
import { HttpError } from '../middleware/errorMiddleware.js'

const TITLE_MAX_LENGTH = 80

function buildTitle(input) {
  if (input.length <= TITLE_MAX_LENGTH) return input
  return `${input.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
}

/** POST /analyze — async errors flow to `errorMiddleware` via `asyncHandler` on the route. */
export async function analyzeMission(req, res) {
  const input = req?.body?.input
  if (typeof input !== 'string' || input.trim().length === 0) {
    throw new HttpError(400, 'input must be a non-empty string')
  }

  const trimmedInput = input.trim()
  const analysis = await generateAnalysisWithGemini(trimmedInput)
  validateAIResponse(analysis)

  let mission
  try {
    const supabase = getSupabaseClient()
    // PostgREST / supabase-js builders send parameterized requests (no string-built SQL).
    const { data, error: dbError } = await supabase
      .from('missions')
      .insert({
        title: buildTitle(trimmedInput),
        description: trimmedInput
      })
      .select('id')
      .single()

    if (dbError) {
      throw new HttpError(502, `Failed to persist mission: ${dbError.message}`)
    }
    mission = data
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(
      503,
      'Database request failed. If this persists, verify SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.'
    )
  }

  return res.json({ missionId: mission.id, ...analysis })
}
