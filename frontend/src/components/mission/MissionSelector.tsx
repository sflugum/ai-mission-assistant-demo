import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getBrowserSupabase } from '../../lib/supabaseClient'
import {
  deleteSavedMission,
  fetchSavedMissions,
  type SavedMissionRow
} from '../../services/missions'
import {
  heroBtnPrimaryClass,
  heroBtnSecondaryClass,
  MarketingHeroTagline,
  MissionMarketingHero
} from './MissionMarketingHero'

const btnResumeCard =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 active:bg-primary/15 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-[3px]'

const btnDeleteCard =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-secondary bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/10 active:bg-secondary/15 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-[3px]'

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

type MissionsLocationState = { focusSaved?: boolean }

export default function MissionSelector() {
  const navigate = useNavigate()
  const location = useLocation()
  const [missions, setMissions] = useState<SavedMissionRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    const client = getBrowserSupabase()
    let cancelled = false

    ;(async () => {
      setListLoading(true)
      setListError(null)
      if (!client) {
        if (!cancelled) {
          setListError(
            'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (use http://127.0.0.1:54321 for local CLI).'
          )
          setMissions([])
          setListLoading(false)
        }
        return
      }
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
  }, [location.pathname, location.key])

  useEffect(() => {
    const state = location.state as MissionsLocationState | null
    if (!state?.focusSaved) return

    document.getElementById('saved-missions')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  function scrollToSaved() {
    document.getElementById('saved-missions')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  async function handleDeleteMission(m: SavedMissionRow) {
    const rawTitle = (m.title ?? '').trim() || 'Untitled mission'
    const label = rawTitle.length > 72 ? `${rawTitle.slice(0, 72)}…` : rawTitle
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return

    const client = getBrowserSupabase()
    setDeleteError(null)
    setDeletingId(m.id)

    const { error } = await deleteSavedMission(client, m.id)
    setDeletingId(null)

    if (error) {
      setDeleteError(error.message)
      return
    }

    setMissions((prev) => prev.filter((row) => row.id !== m.id))
  }

  return (
    <main id="main-content" tabIndex={-1} className="min-h-screen bg-black outline-none">
      <MissionMarketingHero
        description={<MarketingHeroTagline />}
        actions={
          <>
            <button
              type="button"
              className={heroBtnPrimaryClass}
              onClick={() =>
                navigate('/mission/new', { state: { focusWorkspace: true } })
              }
            >
              Start new mission
            </button>
            <button
              type="button"
              className={heroBtnSecondaryClass}
              onClick={scrollToSaved}
            >
              View saved missions
            </button>
          </>
        }
      />

      <section id="saved-missions" className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="space-y-6">
            <div className="space-y-6">
              <h2 className="font-heading text-2xl font-bold tracking-tight text-highlight md:text-3xl">
                Saved missions
              </h2>
              <p className="max-w-2xl font-sans text-lg leading-relaxed text-slate-300">
                Missions you save after Analyze appear here, most recently updated first.
              </p>
            </div>

            {deleteError ? (
              <p className="rounded-xl border border-secondary/40 bg-[#0d0d0d] p-4 font-sans text-sm text-secondary md:p-6">
                {deleteError}
              </p>
            ) : null}

            {listLoading ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-center gap-6 rounded-xl border border-slate-700 bg-[#151515] p-8 md:flex-row md:items-start md:gap-8 md:p-10"
              >
                <div
                  className="h-10 w-10 shrink-0 rounded-full border-2 border-slate-600 border-t-accent animate-spin"
                  aria-hidden="true"
                />
                <div className="space-y-3 text-center md:text-left">
                  <p className="font-heading text-lg font-semibold text-highlight md:text-xl">
                    Loading saved missions
                  </p>
                  <p className="font-sans text-sm leading-relaxed text-slate-300 md:text-base">
                    This demo may take a few extra seconds after idle while connections wake up—hang tight.
                  </p>
                </div>
              </div>
            ) : listError ? (
              <p className="rounded-xl border border-secondary/40 bg-[#0d0d0d] p-6 font-sans text-secondary md:p-8">
                {listError}
              </p>
            ) : missions.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-[#151515] p-6 md:p-8">
                <p className="text-center font-sans text-lg leading-relaxed text-slate-300">
                  No saved missions yet. Start a mission, run Analyze, then use Save mission
                  to add one here.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {missions.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col space-y-6 rounded-xl border border-slate-700 bg-white p-6 md:p-8"
                  >
                    <div className="space-y-6">
                      <div className="space-y-6">
                        <p className="font-heading text-lg font-semibold leading-snug text-slate-900">
                          {m.title}
                        </p>
                        <p className="font-sans text-xs font-semibold uppercase tracking-wide text-secondary">
                          {m.status}
                        </p>
                      </div>
                      <p className="border-l-4 border-accent py-2 pl-6 font-sans text-sm leading-relaxed text-slate-700">
                        Last updated {formatUpdatedAt(m.lastActivityAt)}
                      </p>
                    </div>
                    <div className="mt-auto flex flex-wrap gap-3">
                      <button
                        type="button"
                        className={btnResumeCard}
                        onClick={() => navigate(`/mission/${m.id}`)}
                      >
                        Resume
                      </button>
                      <button
                        type="button"
                        className={btnDeleteCard}
                        disabled={deletingId === m.id}
                        onClick={() => handleDeleteMission(m)}
                      >
                        {deletingId === m.id ? 'Deleting…' : 'Delete'}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </main>
  )
}
