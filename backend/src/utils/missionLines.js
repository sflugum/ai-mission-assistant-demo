/** Count non-empty trimmed lines across the three arrays (for validation before insert). */
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
