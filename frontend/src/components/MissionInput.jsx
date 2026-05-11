const btnAnalyzeBase =
  'rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:brightness-110 active:scale-95 disabled:opacity-60'

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
      <label className="block space-y-6">
        <span className="block font-sans text-sm font-semibold text-highlight">
          Mission input
        </span>
        <textarea
          className="w-full min-h-[140px] resize-y rounded-xl border border-slate-600 bg-black/40 p-6 font-sans text-base leading-relaxed text-slate-100 shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary/30"
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
          <p className="flex-1 rounded-xl border border-accent/50 bg-black/50 p-6 font-sans text-sm font-medium text-accent shadow-sm sm:mt-0 sm:max-w-xl">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  )
}
