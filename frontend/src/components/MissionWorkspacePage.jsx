import { useParams } from 'react-router-dom'
import Header from './Header.jsx'
import MissionInput from './MissionInput.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import { useMission } from '../hooks/useMission.js'

function MissionWorkspacePageInner({ missionId }) {
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

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-slate-800 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <Header homeLink="/missions" />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="bg-surface py-16 outline-none md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {bootstrapping ? (
            <p className="font-sans text-slate-400">Loading mission…</p>
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

/** Remount on `missionId` change so local session state cannot bleed across missions. */
export default function MissionWorkspacePage() {
  const { missionId } = useParams()
  return <MissionWorkspacePageInner key={missionId} missionId={missionId} />
}
