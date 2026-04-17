import React, { useState } from 'react'

let requestCounter = 0
let latestRequestId = 0
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '')
const ANALYZE_URL = API_BASE_URL ? `${API_BASE_URL}/analyze` : '/analyze'

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

export default function App() {
  const [input, setInput] = useState(
    'assess this risk and plan a launch (include missing risks)'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState({ actionPlan: [], risks: [], tools: [] })

  const canSubmit = input.trim().length > 0 && !loading

  function normalizeResponse(data) {
    return {
      actionPlan: data.actionPlan,
      risks: data.risks,
      tools: data.tools
    }
  }

  async function onSubmit(e) {
    e.preventDefault()
    if (loading) return

    const requestId = ++requestCounter
    latestRequestId = requestId

    console.debug('[analyze] start', {
      requestId,
      startedAt: new Date().toISOString()
    })

    setError('')
    setLoading(true)

    try {
      const res = await fetch(ANALYZE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text ? `Request failed: ${text}` : `Request failed: ${res.status}`)
      }

      const data = await res.json()
      if ('plan' in data) {
        console.warn("[DEPRECATION] backend still sending legacy 'plan' field")
      }

      const normalized = normalizeResponse(data)

      if (requestId !== latestRequestId) {
        console.debug('[analyze] stale response ignored', {
          requestId,
          latestRequestId,
          arrivedAt: new Date().toISOString()
        })
        return
      }

      const isFullResponse =
        Array.isArray(normalized.actionPlan) &&
        Array.isArray(normalized.risks) &&
        Array.isArray(normalized.tools)

      if (!isFullResponse) {
        throw new Error('Invalid API response: missing actionPlan')
      }

      console.debug('[analyze] response applied', {
        requestId,
        arrivedAt: new Date().toISOString()
      })

      setResult(normalized)
    } catch (err) {
      if (requestId !== latestRequestId) {
        return
      }
      setError(err?.message || 'Something went wrong.')
    } finally {
      if (requestId === latestRequestId) {
        console.debug('[analyze] finish', {
          requestId,
          finishedAt: new Date().toISOString(),
          loading: false
        })
        setLoading(false)
      }
    }
  }

  return (
    <div className="min-h-screen">
      <header className="mx-auto max-w-4xl px-4 pt-10">
        <h1 className="text-2xl font-bold">AI Mission Assistant</h1>
        <p className="mt-2 text-sm text-slate-400">
          Converts vague mission inputs into: Action Plan, Risks, and Tools.
        </p>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8">
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-slate-200">Mission input</span>
            <textarea
              className="mt-2 w-full min-h-[120px] resize-y rounded-xl border border-slate-800 bg-slate-950/40 p-3 text-sm text-slate-100 outline-none focus:border-indigo-500"
              value={input}
              onChange={(e) => setInput(e.target.value)}
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

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Section title="Action Plan" items={result.actionPlan} loading={loading} />
          <Section title="Risks" items={result.risks} loading={loading} />
          <Section title="Tools" items={result.tools} loading={loading} />
        </div>
      </main>
    </div>
  )
}

