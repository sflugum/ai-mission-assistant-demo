/**
 * Portfolio legal notice — fixed strip; body uses `text-xs` (12px) minimum.
 * Stays below modals (e.g. save dialog uses z-[110]).
 */
export default function DemoDisclaimer() {
  return (
    <aside
      className="fixed bottom-0 left-0 right-0 z-[100] border-t border-slate-700 bg-surface px-3 py-2 sm:px-4 antialiased"
      role="note"
      aria-label="Demonstration disclaimer"
    >
      <div className="mx-auto max-w-4xl max-h-[5.5rem] overflow-y-auto border-l-[3px] border-accent pl-3 sm:max-h-[6.5rem] sm:pl-4">
        <p className="font-heading text-xs font-bold uppercase tracking-wide text-highlight sm:text-sm">
          IMPORTANT: DEMONSTRATION ONLY
        </p>
        <p className="mt-1 font-sans text-xs font-normal leading-snug text-slate-200 sm:text-sm sm:leading-snug">
          This application is a technical portfolio exhibit. All action plans, risk
          assessments, and recommendations are simulated outputs and do{' '}
          <strong className="font-bold -webkit-font-smoothing: antialiased">NOT</strong> constitute
          professional advice. Use of this tool for actual operational planning is{' '}
          <strong className="font-bold -webkit-font-smoothing: antialiased">strictly prohibited</strong>.
          The developer accepts no legal liability for consequences arising from the use
          or misuse of this demonstration.
        </p>
      </div>
    </aside>
  )
}
