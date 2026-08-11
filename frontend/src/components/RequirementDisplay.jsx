/**
 * @param {{
 *   title: string,
 *   items: string[] | undefined,
 *   loading: boolean,
 *   accentBorder: 'accent' | 'secondary' | 'primary'
 * }} props
 */
function Section({ title, items, loading, accentBorder }) {
  // Mapped to a fixed set of literal class names rather than building the
  // class dynamically (e.g. `border-${accentBorder}`). Tailwind only
  // picks up classes it can find as complete strings in the source, so an
  // interpolated one wouldn't get generated.
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
      <div className="space-y-6 rounded-xl border border-slate-700 bg-[#151515] p-6 md:p-8">
        {loading && (items ?? []).length === 0 ? (
          <p className="font-sans leading-relaxed text-slate-300">Generating…</p>
        ) : (items ?? []).length === 0 ? (
          <p className="font-sans leading-relaxed text-slate-300">No results yet.</p>
        ) : (
          <ul className="space-y-6">
            {(items ?? []).map((it, idx) => (
              // Index is part of the key alongside the text itself since
              // list items aren't guaranteed unique on their own (the AI
              // could plausibly return two similar lines).
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

/**
 * Renders the three analysis outputs (Action Plan, Risks, Tools) side by
 * side. `result.actionPlan` etc. are accessed without optional chaining -
 * that's safe because useMission always returns `result` as a fully-formed
 * object with all three arrays defaulted, never undefined, even before any
 * data has loaded.
 */
export default function RequirementDisplay({ result, loading }) {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
      <Section title="Action Plan" accentBorder="accent" items={result.actionPlan} loading={loading} />
      <Section title="Risks" accentBorder="secondary" items={result.risks} loading={loading} />
      <Section title="Tools" accentBorder="primary" items={result.tools} loading={loading} />
    </div>
  )
}
