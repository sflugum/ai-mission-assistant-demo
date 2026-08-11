/**
 * Count non-empty trimmed lines across the three arrays (for validation before insert).
 * Reuses buildLineInsertRows with a throwaway mission id purely to get the
 * row-shaping/trimming logic without duplicating it, the id itself is never
 * persisted here.
 */
export function countPersistableLines(actionPlan, risks, tools) {
  return buildLineInsertRows(
    '00000000-0000-0000-0000-000000000001',
    actionPlan,
    risks,
    tools
  ).length
}

/**
 * @param {string} missionId
 * @param {unknown} actionPlan
 * @param {unknown} risks
 * @param {unknown} tools
 * @returns {{ mission_id: string, category: string, sort_order: number, line_text: string }[]}
 */
export function buildLineInsertRows(missionId, actionPlan, risks, tools) {
  const rows = []

  function push(lines, category) {
    if (!Array.isArray(lines)) return
    let order = 0
    for (const line of lines) {
      if (typeof line !== 'string') continue
      const t = line.trim()
      // Blank/whitespace-only lines are dropped rather than stored.
      // Keeps empty textarea rows from the UI out of the database.
      if (!t) continue
      rows.push({
        mission_id: missionId,
        category,
        sort_order: order++,
        line_text: t
      })
    }
  }

  push(actionPlan, 'action_plan')
  push(risks, 'risk')
  push(tools, 'tool')
  return rows
}
