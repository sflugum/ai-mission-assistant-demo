import { Link } from 'react-router-dom'

const linkBack =
  'mb-6 inline-flex min-h-[44px] min-w-[44px] items-center font-sans text-sm font-semibold text-primary underline decoration-accent decoration-2 underline-offset-4 transition-colors hover:text-slate-950 focus-visible:outline-none'

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
        <div className="flex max-w-2xl gap-3 border-l-[3px] border-accent py-1 pl-4">
          <p className="font-sans text-lg leading-relaxed text-slate-700">
            Converts vague mission inputs into:{' '}
            <span className="font-semibold text-slate-900">Action Plan</span>,
            {' '}
            <span className="font-semibold text-slate-900">Risks</span>, and{' '}
            <span className="font-semibold text-slate-900">Tools</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
