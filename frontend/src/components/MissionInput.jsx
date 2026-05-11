const btnAnalyzeBase =
  'min-h-[44px] min-w-[44px] rounded-xl bg-primary px-6 py-3 text-lg font-extrabold text-white antialiased transition-colors hover:bg-[#3d997c] active:bg-[#368f72] disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface'

export default function MissionInput({
  input,
  onInputChange,
  onSubmit,
  loading,
  error,
  canSubmit
}) {
  /** Empty / bootstrapped: neutral cursor; disabled while analyzing: not-allowed. */
  const analyzeCursor =
    loading ? 'disabled:cursor-not-allowed' : 'disabled:cursor-default'

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <label className="block space-y-2" htmlFor="mission-input">
        <span className="block font-sans text-lg font-bold tracking-tight text-highlight antialiased">
          Mission Input
        </span>
        <textarea
          id="mission-input"
          autoComplete="off"
          spellCheck="true"
          className="w-full min-h-[140px] resize-y rounded-xl border border-slate-600 bg-[#0d0d0d] p-6 font-sans text-base leading-relaxed text-slate-100 antialiased outline-none transition-colors focus-visible:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
          placeholder="Paste or type your mission brief…"
        />
      </label>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
        <button
          type="submit"
          disabled={!canSubmit}
          className={`${btnAnalyzeBase} ${analyzeCursor}`}
        >
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>

        {error ? (
          <p className="flex-1 rounded-xl border border-slate-600 border-l-accent bg-[#141414] p-6 font-sans text-sm font-medium leading-relaxed text-highlight sm:mt-0 sm:max-w-xl">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
