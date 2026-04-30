export default function MissionInput({
  input,
  onInputChange,
  onSubmit,
  loading,
  error,
  canSubmit
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-slate-200">Mission input</span>
        <textarea
          className="mt-2 w-full min-h-[120px] resize-y rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
          value={input}
          onChange={(e) => onInputChange(e.target.value)}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {loading ? 'Analyzing...' : 'Analyze'}
        </button>

        {error ? <p className="text-sm text-red-300">{error}</p> : null}
      </div>
    </form>
  )
}
