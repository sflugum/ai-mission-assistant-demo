import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import MissionInput from './MissionInput.jsx'
import {
  heroBtnPrimaryClass,
  heroBtnSecondaryClass,
  MarketingHeroTagline,
  MissionMarketingHero
} from './mission/MissionMarketingHero'

export default function LandingPage() {
  const navigate = useNavigate()
  const [input, setInput] = useState('')

  function onSubmit(e) {
    e.preventDefault()
    if (input.trim()) {
      navigate('/results', { state: { initialPrompt: input } })
    }
  }

  function onStartFreshMission() {
    navigate('/mission/new', { state: { focusWorkspace: true } })
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
              onClick={onStartFreshMission}
            >
              Start new mission
            </button>
            <Link
              to="/missions"
              state={{ focusSaved: true }}
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
              <div className="space-y-6 border-l-4 border-accent py-2 pl-6">
                <h2 className="font-heading text-xl font-bold text-highlight md:text-2xl">
                  Try a mission brief
                </h2>
                <p className="font-sans text-lg leading-relaxed text-slate-300 md:text-xl">
                  Enter your brief here and watch the AI build your structured plan live on the next screen.
                </p>
              </div>
            </div>

            <MissionInput
              input={input}
              onInputChange={setInput}
              onSubmit={onSubmit}
              loading={false}
              error={""}
              canSubmit={input.trim().length > 0}
            />
          </div>
        </div>
      </section>
    </main>
  )
}