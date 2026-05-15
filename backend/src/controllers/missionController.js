import { getSupabaseClient } from '../config/supabase.js'
import { generateAnalysisWithGemini } from '../services/geminiService.js'
import { validateAIResponse } from '../utils/parser.js'
import { HttpError } from '../middleware/errorMiddleware.js'
import { resolveStoredTitle } from '../utils/missionTitle.js'
import {
  buildLineInsertRows,
  countPersistableLines
} from '../utils/missionLines.js'

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function assertStringArray(name, value) {
  if (!Array.isArray(value)) {
    throw new HttpError(400, `${name} must be an array`)
  }
  for (let i = 0; i < value.length; i++) {
    if (typeof value[i] !== 'string') {
      throw new HttpError(400, `${name} must contain only strings`)
    }
  }
}

function parseSaveBody(body) {
  const description = body?.description
  if (typeof description !== 'string' || description.trim().length === 0) {
    throw new HttpError(400, 'description must be a non-empty string')
  }

  const title = body?.title
  if (title != null && typeof title !== 'string') {
    throw new HttpError(400, 'title must be a string when provided')
  }

  assertStringArray('actionPlan', body?.actionPlan)
  assertStringArray('risks', body?.risks)
  assertStringArray('tools', body?.tools)

  const trimmedDescription = description.trim()
  const resolvedTitle = resolveStoredTitle(title, trimmedDescription)

  if (
    countPersistableLines(body.actionPlan, body.risks, body.tools) === 0
  ) {
    throw new HttpError(
      400,
      'At least one non-empty line is required across actionPlan, risks, and tools'
    )
  }

  return {
    description: trimmedDescription,
    resolvedTitle,
    actionPlan: body.actionPlan,
    risks: body.risks,
    tools: body.tools
  }
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

  return res.json(analysis)
}

/** POST /missions — persist mission brief + selected analysis lines. */
export async function createMission(req, res) {
  const { description, resolvedTitle, actionPlan, risks, tools } = parseSaveBody(
    req.body ?? {}
  )

  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(
      503,
      'Database is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.'
    )
  }

  const { data: mission, error: insertErr } = await supabase
    .from('missions')
    .insert({
      title: resolvedTitle,
      description
    })
    .select('id')
    .single()

  if (insertErr || !mission?.id) {
    throw new HttpError(
      502,
      `Failed to create mission: ${insertErr?.message ?? 'unknown error'}`
    )
  }

  const lineRows = buildLineInsertRows(mission.id, actionPlan, risks, tools)
  if (lineRows.length > 0) {
    const { error: linesErr } = await supabase.from('mission_lines').insert(lineRows)
    if (linesErr) {
      await supabase.from('missions').delete().eq('id', mission.id)
      throw new HttpError(
        502,
        `Failed to save mission lines: ${linesErr.message}`
      )
    }
  }

  return res.status(201).json({ missionId: mission.id })
}

/** PUT /missions/:id — replace mission metadata and all stored lines. */
export async function replaceMission(req, res) {
  const rawId = req.params?.id
  if (typeof rawId !== 'string' || !UUID_RE.test(rawId)) {
    throw new HttpError(400, 'mission id must be a valid UUID')
  }

  const { description, resolvedTitle, actionPlan, risks, tools } = parseSaveBody(
    req.body ?? {}
  )

  let supabase
  try {
    supabase = getSupabaseClient()
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(
      503,
      'Database is not configured: set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY on the server.'
    )
  }

  const { data: existing, error: fetchErr } = await supabase
    .from('missions')
    .select('id')
    .eq('id', rawId)
    .maybeSingle()

  if (fetchErr) {
    throw new HttpError(502, `Failed to verify mission: ${fetchErr.message}`)
  }
  if (!existing) {
    throw new HttpError(404, 'Mission not found')
  }

  const { error: delErr } = await supabase
    .from('mission_lines')
    .delete()
    .eq('mission_id', rawId)

  if (delErr) {
    throw new HttpError(502, `Failed to clear mission lines: ${delErr.message}`)
  }

  const { error: updErr } = await supabase
    .from('missions')
    .update({
      title: resolvedTitle,
      description
    })
    .eq('id', rawId)

  if (updErr) {
    throw new HttpError(502, `Failed to update mission: ${updErr.message}`)
  }

  const lineRows = buildLineInsertRows(rawId, actionPlan, risks, tools)
  if (lineRows.length > 0) {
    const { error: linesErr } = await supabase.from('mission_lines').insert(lineRows)
    if (linesErr) {
      throw new HttpError(
        502,
        `Failed to save mission lines: ${linesErr.message}`
      )
    }
  }

  return res.json({ missionId: rawId })
}
