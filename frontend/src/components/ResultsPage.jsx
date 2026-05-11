import { Link } from 'react-router-dom'
import Header from './Header.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import { useAnalyzeFlow } from '../context/AnalyzeFlowContext.jsx'

export default function ResultsPage() {
  const { result, loading, input } = useAnalyzeFlow()

  const hasRows =
    (result.actionPlan?.length ?? 0) > 0 ||
    (result.risks?.length ?? 0) > 0 ||
    (result.tools?.length ?? 0) > 0

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
    </div>
  )
}
