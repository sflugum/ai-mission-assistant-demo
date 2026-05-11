import { useNavigate, Link } from 'react-router-dom'
import MissionInput from './MissionInput.jsx'
import { useAnalyzeFlow } from '../context/AnalyzeFlowContext.jsx'
import {
  heroBtnPrimaryClass,
  heroBtnSecondaryClass,
  MarketingHeroTagline,
  MissionMarketingHero
} from './mission/MissionMarketingHero'

export default function LandingPage() {
  const navigate = useNavigate()
  const {
    input,
    setInput,
    loading,
    error,
    canSubmit,
    submitAnalyze,
    resetSession
  } = useAnalyzeFlow()

  async function onSubmit(e) {
    const ok = await submitAnalyze(e)
    if (ok) navigate('/results')
  }

  function onStartFreshMission() {
    resetSession()
    navigate('/mission/new')
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
              onClick={onStartFreshMission}
            >
              Start new mission
            </button>
            <Link
              to="/missions"
              className={`${heroBtnSecondaryClass} cursor-pointer text-center`}
            >
              View saved missions
            </Link>
          </>
        }
      />

      <section className="bg-surface py-16 md:py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="space-y-8">
            <div className="space-y-6">
              <span className="font-heading text-sm font-bold uppercase tracking-widest text-highlight">
                Quick analyze
              </span>
              <div className="space-y-6 border-l-4 border-primary py-2 pl-6">
                <h2 className="font-heading text-xl font-bold text-highlight md:text-2xl">
                  Try a mission brief
                </h2>
                <p className="font-sans text-lg leading-relaxed text-slate-300 md:text-xl">
                  Run analysis here and view structured results on the next
                  screen—no repeat request.
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
        </div>
      </section>
    </div>
  )
}
