/**
 * Portfolio legal notice — shown on every route; keep typography ≥12px and leave
 * routed content bottom padding in App so fixed placement does not cover actions.
 */
export default function DemoDisclaimer() {
  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-700/60 bg-surface px-4 py-3 antialiased sm:px-6 md:py-3.5"
      role="note"
      aria-label="Demonstration disclaimer"
    >
      <div className="mx-auto max-w-4xl max-h-[30vh] overflow-y-auto border-l-[3px] border-accent pl-4 sm:max-h-[28vh] md:max-h-none md:pl-5">
        <p className="font-heading text-xl font-extrabold uppercase tracking-wide text-highlight sm:text-2xl">
          IMPORTANT: DEMONSTRATION ONLY
        </p>
        <p className="mt-3 font-sans text-sm font-normal leading-relaxed text-slate-200 sm:text-base sm:leading-relaxed md:leading-snug">
          This application is a technical portfolio exhibit. All action plans, risk
          assessments, and recommendations are simulated outputs and do{' '}
          <strong className="text-lg font-extrabold leading-snug text-highlight sm:text-xl">
            NOT
          </strong>{' '}
          constitute professional advice. Use of this tool for actual operational
          planning is{' '}
          <strong className="text-lg font-extrabold leading-snug text-highlight sm:text-xl">
            strictly prohibited
          </strong>
          . The developer accepts no legal liability for consequences arising from the
          use or misuse of this demonstration.
        </p>
      </div>
    </aside>
  )
}
