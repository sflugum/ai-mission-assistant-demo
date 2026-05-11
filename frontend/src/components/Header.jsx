import { Link } from 'react-router-dom'

const linkBack =
  'mb-6 inline-block font-sans text-sm font-semibold text-primary transition-all hover:brightness-110 active:scale-95'

export default function Header({ homeLink, backLabel = 'All missions' }) {
  return (
    <div className="space-y-6">
      {homeLink ? (
        <Link to={homeLink} className={linkBack}>
          ← {backLabel}
        </Link>
      ) : null}
      <div className="space-y-6">
        <h1 className="font-heading text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
          AI Mission Assistant
        </h1>
        <p className="max-w-2xl font-sans text-lg leading-relaxed text-slate-600">
          Converts vague mission inputs into: Action Plan, Risks, and Tools.
        </p>
      </div>
    </div>
  )
}
