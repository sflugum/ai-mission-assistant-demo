import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getBrowserSupabase } from '../../lib/supabaseClient'
import {
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
  'inline-flex items-center justify-center rounded-xl border-2 border-primary bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm transition-all hover:bg-primary/10 active:scale-95'

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

  function scrollToSaved() {
    document.getElementById('saved-missions')?.scrollIntoView({
      behavior: 'smooth'
    })
  }

  return (
    <div className="min-h-screen bg-black">
      <MissionMarketingHero
        description={<MarketingHeroTagline />}
        actions={
          <>
            <button
              type="button"
              className={heroBtnPrimaryClass}
              onClick={() => navigate('/mission/new')}
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
                Most recently analyzed missions appear first.
              </p>
            </div>

            {listLoading ? (
              <p className="font-sans text-slate-400">Loading missions…</p>
            ) : listError ? (
              <p className="rounded-xl border border-secondary/40 bg-black/40 p-6 font-sans text-secondary shadow-sm md:p-8">
                {listError}
              </p>
            ) : missions.length === 0 ? (
              <div className="rounded-xl border border-slate-700 bg-black/30 p-6 shadow-sm md:p-8">
                <p className="text-center font-sans text-lg leading-relaxed text-slate-300">
                  No saved missions yet. Start above, run Analyze once, and your
                  mission will slot into this three-column grid.
                </p>
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-8 md:grid-cols-3">
                {missions.map((m) => (
                  <li
                    key={m.id}
                    className="flex flex-col space-y-6 rounded-xl border border-slate-700 bg-white p-6 shadow-sm md:p-8"
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
                      <p className="border-l-4 border-primary py-2 pl-6 font-sans text-sm leading-relaxed text-slate-600">
                        Last updated {formatUpdatedAt(m.lastActivityAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className={`${btnResumeCard} mt-auto self-start`}
                      onClick={() => navigate(`/mission/${m.id}`)}
                    >
                      Resume
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
