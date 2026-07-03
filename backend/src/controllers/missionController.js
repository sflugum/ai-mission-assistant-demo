import { getNeonPool } from '../config/neon.js'
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

export async function createMission(req, res) {
  const { description, resolvedTitle, actionPlan, risks, tools } = parseSaveBody(
    req.body ?? {}
  )

  const pool = getNeonPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const missionRes = await client.query(
      'INSERT INTO missions (title, description) VALUES ($1, $2) RETURNING id',
      [resolvedTitle, description]
    )
    const missionId = missionRes.rows[0].id

    const lineRows = buildLineInsertRows(missionId, actionPlan, risks, tools)
    
    if (lineRows.length > 0) {
      const keys = Object.keys(lineRows[0])
      const values = []
      const placeholders = []
      
      let paramIndex = 1
      for (const row of lineRows) {
        const rowPlaceholders = []
        for (const key of keys) {
          values.push(row[key])
          rowPlaceholders.push(`$${paramIndex++}`)
        }
        placeholders.push(`(${rowPlaceholders.join(', ')})`)
      }
      
      await client.query(
        `INSERT INTO mission_lines (${keys.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values
      )
    }

    await client.query('COMMIT')
    return res.status(201).json({ missionId })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err instanceof HttpError) throw err
    throw new HttpError(502, `Failed to create mission: ${err.message}`)
  } finally {
    client.release()
  }
}

export async function replaceMission(req, res) {
  const rawId = req.params?.id
  if (typeof rawId !== 'string' || !UUID_RE.test(rawId)) {
    throw new HttpError(400, 'mission id must be a valid UUID')
  }

  const { description, resolvedTitle, actionPlan, risks, tools } = parseSaveBody(
    req.body ?? {}
  )

  const pool = getNeonPool()
  const client = await pool.connect()

  try {
    await client.query('BEGIN')

    const checkRes = await client.query('SELECT id FROM missions WHERE id = $1', [rawId])
    if (checkRes.rowCount === 0) {
      throw new HttpError(404, 'Mission not found')
    }

    await client.query('DELETE FROM mission_lines WHERE mission_id = $1', [rawId])

    await client.query(
      'UPDATE missions SET title = $1, description = $2 WHERE id = $3',
      [resolvedTitle, description, rawId]
    )

    const lineRows = buildLineInsertRows(rawId, actionPlan, risks, tools)
    
    // Efficiency Upgrade: Bulk Insert
    if (lineRows.length > 0) {
      const keys = Object.keys(lineRows[0])
      const values = []
      const placeholders = []
      
      let paramIndex = 1
      for (const row of lineRows) {
        const rowPlaceholders = []
        for (const key of keys) {
          values.push(row[key])
          rowPlaceholders.push(`$${paramIndex++}`)
        }
        placeholders.push(`(${rowPlaceholders.join(', ')})`)
      }
      
      await client.query(
        `INSERT INTO mission_lines (${keys.join(', ')}) VALUES ${placeholders.join(', ')}`,
        values
      )
    }

    await client.query('COMMIT')
    return res.json({ missionId: rawId })
  } catch (err) {
    await client.query('ROLLBACK')
    if (err instanceof HttpError) throw err
    throw new HttpError(502, `Failed to update mission: ${err.message}`)
  } finally {
    client.release()
  }
}

export async function getMissions(req, res) {
  const pool = getNeonPool()
  try {
    const { rows } = await pool.query(
      'SELECT id, title, status, created_at, updated_at FROM missions ORDER BY COALESCE(updated_at, created_at) DESC'
    )
    return res.json(rows)
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(502, `Failed to fetch missions: ${err.message}`)
  }
}

export async function getMissionById(req, res) {
  const rawId = req.params?.id
  if (typeof rawId !== 'string' || !UUID_RE.test(rawId)) {
    throw new HttpError(400, 'mission id must be a valid UUID')
  }

  const pool = getNeonPool()
  try {
    const missionRes = await pool.query(
      'SELECT title, description FROM missions WHERE id = $1',
      [rawId]
    )
    if (missionRes.rowCount === 0) {
      throw new HttpError(404, 'Mission not found')
    }
    const mission = missionRes.rows[0]

    const linesRes = await pool.query(
      'SELECT category, sort_order, line_text FROM mission_lines WHERE mission_id = $1 ORDER BY sort_order ASC',
      [rawId]
    )

    const actionPlan = []
    const risks = []
    const tools = []

    for (const row of linesRes.rows) {
      if (row.category === 'action_plan') actionPlan.push(row.line_text)
      else if (row.category === 'risk') risks.push(row.line_text)
      else if (row.category === 'tool') tools.push(row.line_text)
    }

    return res.json({
      title: mission.title,
      description: mission.description,
      actionPlan,
      risks,
      tools
    })
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(502, `Failed to fetch mission: ${err.message}`)
  }
}

export async function deleteMission(req, res) {
  const rawId = req.params?.id
  if (typeof rawId !== 'string' || !UUID_RE.test(rawId)) {
    throw new HttpError(400, 'mission id must be a valid UUID')
  }

  const pool = getNeonPool()
  try {
    // Efficiency Upgrade: Transaction removed. 
    // ON DELETE CASCADE handles the mission_lines automatically.
    const delRes = await pool.query('DELETE FROM missions WHERE id = $1', [rawId])
    
    if (delRes.rowCount === 0) {
      throw new HttpError(404, 'Mission not found')
    }

    return res.status(204).send()
  } catch (err) {
    if (err instanceof HttpError) throw err
    throw new HttpError(502, `Failed to delete mission: ${err.message}`)
  }
}