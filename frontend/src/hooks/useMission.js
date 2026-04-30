import { useState } from 'react'
import { analyzeMission } from '../services/api.js'

let requestCounter = 0
let latestRequestId = 0

function normalizeResponse(data) {
  return {
    actionPlan: data.actionPlan,
    risks: data.risks,
    tools: data.tools
  }
}

export function useMission() {
  const [input, setInput] = useState(
    'assess this risk and plan a launch (include missing risks)'
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState({ actionPlan: [], risks: [], tools: [] })

  const canSubmit = input.trim().length > 0 && !loading

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
      const data = await analyzeMission(input)

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

  return {
    input,
    setInput,
    loading,
    error,
    result,
    canSubmit,
    onSubmit
  }
}
