import { useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import MissionInput from './MissionInput.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import { useMission } from '../hooks/useMission.js'

function MissionWorkspacePageInner({ missionId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const {
    input,
    setInput,
    loading,
    bootstrapping,
    error,
    result,
    canSubmit,
    onSubmit
  } = useMission(missionId)

  useEffect(() => {
    const state = location.state
    if (
      !state ||
      typeof state !== 'object' ||
      !('focusWorkspace' in state) ||
      !state.focusWorkspace
    ) {
      return
    }

    document.getElementById('mission-workspace')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-slate-800 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <Header homeLink="/missions" />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="bg-surface py-16 outline-none md:py-24">
        <div id="mission-workspace" className="mx-auto max-w-7xl px-6">
          {bootstrapping ? (
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
                  Loading mission
                </p>
                <p className="font-sans text-sm leading-relaxed text-slate-300 md:text-base">
                  This demo may take a few extra seconds after idle while connections wake up—hang tight.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-12 md:space-y-16">
              <div className="mx-auto max-w-3xl space-y-8">
                <div className="space-y-6">
                  <span className="font-heading text-sm font-bold uppercase tracking-widest text-highlight">
                    Mission focus
                  </span>
                  <div className="space-y-6 border-l-4 border-accent py-2 pl-6">
                    <h2 className="font-heading text-xl font-bold text-highlight md:text-2xl">
                      Mission statement
                    </h2>
                    <p className="font-sans text-lg leading-relaxed text-slate-300 md:text-xl">
                      Describe outcomes, constraints, and stakeholders. Richer
                      briefs produce sharper action plans, risks, and tools below.
                    </p>
                  </div>
                </div>

                <MissionInput
                  input={input}
                  onInputChange={setInput}
                  onSubmit={onSubmit}
                  loading={loading}
                  error={error}
                  canSubmit={canSubmit}
                />
              </div>

              <RequirementDisplay result={result} loading={loading} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/** Changing `:missionId` remounts inner state so two missions never share textarea / analyze results. */
export default function MissionWorkspacePage() {
  const { missionId } = useParams()
  return <MissionWorkspacePageInner key={missionId} missionId={missionId} />
}
