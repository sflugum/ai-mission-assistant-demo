import { useEffect, useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import MissionInput from './MissionInput.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import SaveMissionModal from './SaveMissionModal.jsx'
import { useMission, isValidMissionUuid } from '../hooks/useMission.js'

function hasAnalysisRows(r) {
  const a = r?.actionPlan?.length ?? 0
  const b = r?.risks?.length ?? 0
  const c = r?.tools?.length ?? 0
  return a + b + c > 0
}

function MissionWorkspacePageInner({ missionId }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [saveModalOpen, setSaveModalOpen] = useState(false)
  const {
    input,
    setInput,
    loading,
    bootstrapping,
    error,
    result,
    canSubmit,
    onSubmit,
    showSaveOffer,
    dismissSaveOffer,
    acknowledgeSaveComplete
  } = useMission(missionId)

  const routePersistId = isValidMissionUuid(missionId) ? missionId : null

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

                {!loading && showSaveOffer && hasAnalysisRows(result) ? (
                  <div className="flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#151515] p-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                    <p className="font-sans text-sm leading-relaxed text-slate-300 sm:flex-1">
                      Save this analysis to your mission list, or continue without saving.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl bg-primary px-5 py-2 font-heading text-sm font-semibold text-white hover:bg-[#3d997c] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={() => setSaveModalOpen(true)}
                      >
                        Save mission…
                      </button>
                      <button
                        type="button"
                        className="inline-flex min-h-[44px] items-center justify-center rounded-xl border-2 border-slate-500 px-5 py-2 font-heading text-sm font-semibold text-slate-200 hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        onClick={dismissSaveOffer}
                      >
                        Not now
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>

              <RequirementDisplay result={result} loading={loading} />

              <SaveMissionModal
                open={saveModalOpen}
                onClose={() => setSaveModalOpen(false)}
                description={input}
                result={result}
                routeMissionId={routePersistId}
                onSaveComplete={(id) => {
                  acknowledgeSaveComplete()
                  navigate(`/mission/${id}`, {
                    state: {
                      savedSnapshot: {
                        description: input.trim(),
                        actionPlan: result.actionPlan ?? [],
                        risks: result.risks ?? [],
                        tools: result.tools ?? []
                      }
                    }
                  })
                }}
              />
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
