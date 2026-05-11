import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBrowserSupabase } from '../../lib/supabaseClient'
import {
  fetchSavedMissions,
  type SavedMissionRow
} from '../../services/missions'

function formatUpdatedAt(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return '—'
  }
}

export default function MissionSelector() {
  const navigate = useNavigate()
  const [missions, setMissions] = useState<SavedMissionRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)

  useEffect(() => {
    const client = getBrowserSupabase()
    let cancelled = false

    ;(async () => {
      setListLoading(true)
      setListError(null)
      const { data, error } = await fetchSavedMissions(client)
      if (cancelled) return
      if (error) {
        setListError(error.message)
        setMissions([])
      } else {
        setMissions(data)
      }
      setListLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-4xl px-4 pt-10">
        <h1 className="text-2xl font-bold">AI Mission Assistant</h1>
        <p className="mt-2 text-sm text-slate-400">
          Start a new mission or resume one you saved.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <section className="mb-10 rounded-2xl border border-indigo-500/40 bg-indigo-950/30 p-6">
          <h2 className="text-lg font-semibold text-slate-100">New mission</h2>
          <p className="mt-2 text-sm text-slate-400">
            Begin with a clean workspace. Nothing from previous sessions is kept.
          </p>
          <button
            type="button"
            className="mt-4 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
            onClick={() => navigate('/mission/new')}
          >
            Start new mission
          </button>
        </section>

        <section>
          <h2 className="text-base font-semibold text-slate-200">Saved missions</h2>

          {listLoading ? (
            <p className="mt-4 text-sm text-slate-400">Loading missions…</p>
          ) : listError ? (
            <p className="mt-4 text-sm text-red-300">{listError}</p>
          ) : missions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center">
              <p className="text-sm text-slate-400">
                No saved missions yet. Run an analysis from a new mission and it will appear here.
              </p>
            </div>
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {missions.map((m) => (
                <li
                  key={m.id}
                  className="flex flex-col rounded-xl border border-slate-800 bg-slate-900/40 p-4"
                >
                  <p className="font-medium text-slate-100">{m.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                    {m.status}
                  </p>
                  <p className="mt-2 text-xs text-slate-500">
                    Last updated {formatUpdatedAt(m.updated_at)}
                  </p>
                  <button
                    type="button"
                    className="mt-4 self-start rounded-lg bg-slate-700 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-600"
                    onClick={() => navigate(`/mission/${m.id}`)}
                  >
                    Resume
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  )
}
