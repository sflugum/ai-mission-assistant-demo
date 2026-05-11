import { Link } from 'react-router-dom'

export default function Header({ homeLink }) {
  return (
    <header className="mx-auto max-w-4xl px-4 pt-10">
      {homeLink ? (
        <Link
          to={homeLink}
          className="mb-4 inline-block text-sm font-medium text-indigo-400 hover:text-indigo-300"
        >
          ← All missions
        </Link>
      ) : null}
      <h1 className="text-2xl font-bold">AI Mission Assistant</h1>
      <p className="mt-2 text-sm text-slate-400">
        Converts vague mission inputs into: Action Plan, Risks, and Tools.
      </p>
    </header>
  )
}
