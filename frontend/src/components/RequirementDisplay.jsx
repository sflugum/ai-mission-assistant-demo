function Section({ title, items, loading }) {
  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <h2 className="text-base font-semibold text-slate-100">{title}</h2>
      <div className="mt-3 space-y-2">
        {loading && (items ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">Generating...</p>
        ) : (items ?? []).length === 0 ? (
          <p className="text-sm text-slate-400">No results yet.</p>
        ) : (
          (items ?? []).map((it, idx) => (
            <p key={`${idx}-${it}`} className="text-sm text-slate-200">
              {it}
            </p>
          ))
        )}
      </div>
    </section>
  )
}

export default function RequirementDisplay({ result, loading }) {
  return (
    <div className="mt-8 grid gap-4 md:grid-cols-3">
      <Section title="Action Plan" items={result.actionPlan} loading={loading} />
      <Section title="Risks" items={result.risks} loading={loading} />
      <Section title="Tools" items={result.tools} loading={loading} />
    </div>
  )
}
