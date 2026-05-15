import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Header from './Header.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import SaveMissionModal from './SaveMissionModal.jsx'
import { useAnalyzeFlow } from '../context/AnalyzeFlowContext.jsx'

export default function ResultsPage() {
  const navigate = useNavigate()
  const { result, loading, input } = useAnalyzeFlow()
  const [saveDismissed, setSaveDismissed] = useState(false)
  const [saveModalOpen, setSaveModalOpen] = useState(false)

  const hasRows =
    (result.actionPlan?.length ?? 0) > 0 ||
    (result.risks?.length ?? 0) > 0 ||
    (result.tools?.length ?? 0) > 0

  useEffect(() => {
    setSaveDismissed(false)
  }, [result.actionPlan, result.risks, result.tools, input])

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-slate-800 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">
          <Header homeLink="/" backLabel="Home" />
        </div>
      </header>

      <main id="main-content" tabIndex={-1} className="bg-surface py-16 outline-none md:py-24">
        <div className="mx-auto max-w-7xl px-6">
          {input.trim() ? (
            <p className="mb-12 rounded-xl border border-slate-700 bg-[#151515] p-6 font-sans text-sm leading-relaxed text-slate-300 md:p-8 md:text-base">
              <span className="font-semibold text-highlight">Brief: </span>
              {input.trim()}
            </p>
          ) : null}

          {!loading && hasRows && !saveDismissed ? (
            <div className="mb-10 flex flex-col gap-3 rounded-xl border border-slate-700 bg-[#151515] p-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
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
                  onClick={() => setSaveDismissed(true)}
                >
                  Not now
                </button>
              </div>
            </div>
          ) : null}

          <RequirementDisplay result={result} loading={loading} />

          {!loading && !hasRows ? (
            <p className="mt-10 text-center font-sans text-slate-400">
              <Link
                to="/"
                className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center font-heading text-sm font-bold text-primary underline decoration-accent decoration-2 underline-offset-4 hover:text-[#3d997c] focus-visible:outline-none"
              >
                Return home to run Analyze
              </Link>
            </p>
          ) : null}
        </div>
      </main>

      <SaveMissionModal
        open={saveModalOpen}
        onClose={() => setSaveModalOpen(false)}
        description={input}
        result={result}
        routeMissionId={null}
        onSaveComplete={(id) => {
          setSaveDismissed(true)
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
  )
}
