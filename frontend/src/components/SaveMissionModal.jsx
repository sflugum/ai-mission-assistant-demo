import { useEffect, useMemo, useState } from 'react'
import {
  createMissionPersist,
  replaceMissionPersist
} from '../services/missionsApi.js'
import { isValidMissionUuid } from '../hooks/useMission.js'

const TITLE_PREVIEW_MAX = 80

function previewDefaultTitle(description) {
  const d = typeof description === 'string' ? description.trim() : ''
  if (!d) return 'Untitled mission'
  if (d.length <= TITLE_PREVIEW_MAX) return d
  return `${d.slice(0, TITLE_PREVIEW_MAX).trimEnd()}…`
}

function initialSelection(result) {
  return {
    actionPlan: (result?.actionPlan ?? []).map(() => true),
    risks: (result?.risks ?? []).map(() => true),
    tools: (result?.tools ?? []).map(() => true)
  }
}

function filterBySelection(lines, selected) {
  return (lines ?? []).filter((_, i) => selected[i] === true)
}

export default function SaveMissionModal({
  open,
  onClose,
  description,
  result,
  routeMissionId,
  onSaveComplete
}) {
  const [title, setTitle] = useState('')
  const [selection, setSelection] = useState(() => initialSelection(result))
  const [saveMode, setSaveMode] = useState('create')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const defaultPreview = useMemo(
    () => previewDefaultTitle(description),
    [description]
  )

  useEffect(() => {
    if (!open) return
    setTitle('')
    setSelection(initialSelection(result))
    setSaveMode('create')
    setError('')
    setSaving(false)
  }, [open, result])

  const canReplace = isValidMissionUuid(routeMissionId ?? '')

  function toggleLine(category, index) {
    setSelection((prev) => {
      const next = { ...prev, [category]: [...prev[category]] }
      next[category][index] = !next[category][index]
      return next
    })
  }

  function setAll(category, value) {
    setSelection((prev) => ({
      ...prev,
      [category]: (result?.[category] ?? []).map(() => value)
    }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    const actionPlan = filterBySelection(result?.actionPlan, selection.actionPlan)
    const risks = filterBySelection(result?.risks, selection.risks)
    const tools = filterBySelection(result?.tools, selection.tools)

    if (
      actionPlan.length + risks.length + tools.length === 0
    ) {
      setError('Select at least one line to save, or cancel.')
      return
    }

    const trimmedDesc = (description ?? '').trim()
    if (!trimmedDesc) {
      setError('Mission brief is empty; add text before saving.')
      return
    }

    const payload = {
      description: trimmedDesc,
      actionPlan,
      risks,
      tools
    }
    const t = title.trim()
    if (t.length > 0) {
      payload.title = t
    }

    setSaving(true)
    try {
      const useReplace = canReplace && saveMode === 'replace'
      const res = useReplace
        ? await replaceMissionPersist(routeMissionId, payload)
        : await createMissionPersist(payload)
      onSaveComplete?.(res.missionId)
      onClose?.()
    } catch (err) {
      setError(err?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  if (!open) return null

  function Section({ cat, label }) {
    const lines = result?.[cat] ?? []
    const sel = selection[cat] ?? []
    const allOn = lines.length > 0 && sel.every(Boolean)

    return (
      <fieldset className="space-y-4 rounded-xl border border-slate-700 bg-[#151515] p-4 md:p-6">
        <legend className="px-1 font-heading text-sm font-bold text-highlight">
          {label}
        </legend>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="font-sans text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-[#3d997c] focus-visible:outline-none"
            onClick={() => setAll(cat, true)}
          >
            Select all
          </button>
          <span className="text-slate-500" aria-hidden="true">
            |
          </span>
          <button
            type="button"
            className="font-sans text-sm font-semibold text-slate-400 underline underline-offset-4 hover:text-slate-200 focus-visible:outline-none"
            onClick={() => setAll(cat, false)}
          >
            Clear
          </button>
        </div>
        {lines.length === 0 ? (
          <p className="font-sans text-sm text-slate-400">No lines in this section.</p>
        ) : (
          <ul className="max-h-40 space-y-3 overflow-y-auto pr-1 md:max-h-48">
            {lines.map((line, idx) => (
              <li key={`${cat}-${idx}`} className="flex gap-3">
                <input
                  type="checkbox"
                  id={`${cat}-${idx}`}
                  checked={sel[idx] === true}
                  onChange={() => toggleLine(cat, idx)}
                  className="mt-1 h-4 w-4 shrink-0 rounded border-slate-500 text-primary focus:ring-accent"
                />
                <label
                  htmlFor={`${cat}-${idx}`}
                  className="font-sans text-sm leading-relaxed text-slate-200"
                >
                  {line}
                </label>
              </li>
            ))}
          </ul>
        )}
        {lines.length > 0 ? (
          <p className="font-sans text-xs text-slate-500">
            {allOn ? 'All lines in this section will be saved.' : 'Only checked lines are saved.'}
          </p>
        ) : null}
      </fieldset>
    )
  }

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 p-4 pb-28 sm:pb-24"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="save-mission-title"
        className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-slate-600 bg-[#0d0d0d] p-6 shadow-xl md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <h2
            id="save-mission-title"
            className="font-heading text-xl font-bold text-highlight md:text-2xl"
          >
            Save mission
          </h2>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-slate-600 font-sans text-lg leading-none text-slate-300 antialiased hover:bg-slate-800 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:pointer-events-none disabled:opacity-50"
            aria-label="Close save dialog"
            disabled={saving}
            onClick={() => onClose?.()}
          >
            ×
          </button>
        </div>
        <p className="mt-3 font-sans text-sm leading-relaxed text-slate-300">
          Add an optional title (if you leave it blank, we use{' '}
          <span className="font-semibold text-highlight">{defaultPreview}</span>
          ). Choose which lines to keep in each section.
        </p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-8">
          <label className="block space-y-3">
            <span className="font-sans text-sm font-bold text-highlight">
              Mission title (optional)
            </span>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={defaultPreview}
              maxLength={200}
              className="w-full rounded-xl border border-slate-600 bg-[#141414] px-4 py-3 font-sans text-base text-slate-100 focus-visible:border-accent focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d0d0d]"
            />
          </label>

          {canReplace ? (
            <fieldset className="space-y-3 rounded-xl border border-slate-700 bg-[#151515] p-4">
              <legend className="px-1 font-heading text-sm font-bold text-highlight">
                Save mode
              </legend>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="save-mode"
                  value="create"
                  checked={saveMode === 'create'}
                  onChange={() => setSaveMode('create')}
                  className="mt-1"
                />
                <span className="font-sans text-sm text-slate-200">
                  Create a new saved mission
                </span>
              </label>
              <label className="flex cursor-pointer items-start gap-3">
                <input
                  type="radio"
                  name="save-mode"
                  value="replace"
                  checked={saveMode === 'replace'}
                  onChange={() => setSaveMode('replace')}
                  className="mt-1"
                />
                <span className="font-sans text-sm text-slate-200">
                  Replace the current mission
                </span>
              </label>
            </fieldset>
          ) : null}

          <Section cat="actionPlan" label="Action plan" />
          <Section cat="risks" label="Risks" />
          <Section cat="tools" label="Tools" />

          {error ? (
            <p className="rounded-xl border border-secondary/40 bg-[#141414] p-4 font-sans text-sm text-secondary">
              {error}
            </p>
          ) : null}

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-slate-500 px-5 py-2 font-heading text-sm font-semibold text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-50"
              disabled={saving}
              onClick={() => !saving && onClose?.()}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-2 font-heading text-sm font-semibold text-white hover:bg-[#3d997c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-60"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
