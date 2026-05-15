export const TITLE_MAX_LENGTH = 80

export function buildTitle(input) {
  if (input.length <= TITLE_MAX_LENGTH) return input
  return `${input.slice(0, TITLE_MAX_LENGTH).trimEnd()}…`
}

/** Optional user title, else truncated mission brief (same rules as legacy analyze insert). */
export function resolveStoredTitle(userTitle, description) {
  const d = typeof description === 'string' ? description.trim() : ''
  const u = typeof userTitle === 'string' ? userTitle.trim() : ''
  if (u.length > 0) return buildTitle(u)
  return buildTitle(d.length > 0 ? d : 'Untitled mission')
}
