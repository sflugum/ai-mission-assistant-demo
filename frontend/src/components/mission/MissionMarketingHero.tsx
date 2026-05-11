import type { ReactNode } from 'react'

const focusRingHero =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-white'

/** ≥44px tall tap target (WCAG 2.2 target size advisories where applicable). */
export const heroBtnPrimaryClass =
  `inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl bg-primary px-8 py-3 text-lg font-extrabold text-white antialiased transition-colors hover:bg-[#2f8a6c] active:bg-[#287a5f] disabled:pointer-events-none disabled:opacity-60 ${focusRingHero}`

export const heroBtnSecondaryClass =
  `inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-secondary bg-white px-8 py-3 text-lg font-extrabold text-secondary antialiased transition-colors hover:bg-secondary/10 active:bg-secondary/15 ${focusRingHero}`

/** Canonical hero tagline — used on `/` and `/missions` so both stay in sync. */
export function MarketingHeroTagline() {
  return (
    <div className="space-y-1">
      <h2 className="font-heading text-lg font-semibold leading-snug tracking-tight text-slate-900">
        Transform rough drafts into roadmaps
      </h2>
      <span
        className="inline-block h-1 w-12 rounded-full bg-accent"
        aria-hidden="true"
      />
      <p className="font-sans text-sm italic leading-relaxed text-slate-600">
        or resume a saved mission below
      </p>
    </div>
  )
}

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
        <span className="flex items-center gap-2 font-heading text-sm font-bold uppercase tracking-widest text-slate-900">
          <span
            className="inline-block h-5 w-[3px] shrink-0 rounded-sm bg-accent"
            aria-hidden="true"
          />
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
