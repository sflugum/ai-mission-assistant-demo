function Section({ title, items, loading, accentBorder }) {
  const border =
    accentBorder === 'accent'
      ? 'border-accent'
      : accentBorder === 'secondary'
        ? 'border-secondary'
        : 'border-primary'

  return (
    <section className={`space-y-6 border-l-4 py-2 pl-6 ${border}`}>
      <h2 className="font-heading text-lg font-bold text-highlight md:text-xl">
        {title}
      </h2>
      <div className="space-y-6 rounded-xl border border-slate-700 bg-black/30 p-6 shadow-sm md:p-8">
        {loading && (items ?? []).length === 0 ? (
          <p className="font-sans leading-relaxed text-slate-300">Generating…</p>
        ) : (items ?? []).length === 0 ? (
          <p className="font-sans leading-relaxed text-slate-300">No results yet.</p>
        ) : (
          <ul className="space-y-6">
            {(items ?? []).map((it, idx) => (
              <li
                key={`${idx}-${it}`}
                className="font-sans text-base leading-relaxed text-slate-200"
              >
                {it}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

export default function RequirementDisplay({ result, loading }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <Section title="Action Plan" accentBorder="accent" items={result.actionPlan} loading={loading} />
      <Section title="Risks" accentBorder="secondary" items={result.risks} loading={loading} />
      <Section title="Tools" accentBorder="primary" items={result.tools} loading={loading} />
    </div>
  )
}
