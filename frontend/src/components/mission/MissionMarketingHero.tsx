import type { ReactNode } from 'react'

/** Canonical hero tagline — used on `/` and `/missions` so both stay in sync. */
export function MarketingHeroTagline() {
  return (
    <div className="space-y-1">
      <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight text-slate-900">
        Transform rough drafts into roadmaps
      </h2>
      <p className="font-sans text-sm italic leading-relaxed text-slate-600">
        or resume a saved mission below
      </p>
    </div>
  )
}

/** Shared landing / saved-missions hero — keep all marketing hero UI here to avoid layout drift. */
export const heroBtnPrimaryClass =
  'inline-flex items-center justify-center rounded-xl bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-110 active:scale-95'

export const heroBtnSecondaryClass =
  'inline-flex items-center justify-center rounded-xl border-2 border-secondary px-8 py-3 text-sm font-semibold text-secondary shadow-sm transition-all hover:bg-secondary/10 active:scale-95'

type MissionMarketingHeroProps = {
  description: ReactNode
  actions: ReactNode
}

export function MissionMarketingHero({
  description,
  actions
}: MissionMarketingHeroProps) {
  const descriptionEl =
    typeof description === 'string' ? (
      <p className="font-sans text-xl leading-relaxed text-slate-600">{description}</p>
    ) : (
      description
    )

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-7xl space-y-8 px-6">
        <span className="font-heading text-sm font-bold uppercase tracking-widest text-primary">
          Structured missions
        </span>
        <h1 className="font-heading text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
          AI Mission Assistant
        </h1>
        {descriptionEl}
        <div className="flex flex-wrap gap-4">{actions}</div>
      </div>
    </section>
  )
}
