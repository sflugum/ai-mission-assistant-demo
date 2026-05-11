import { useCallback, useEffect, useRef, useState } from 'react'
import { analyzeMission } from '../services/aiService.js'
import { getBrowserSupabase } from '../lib/supabaseClient'
import { fetchMissionById } from '../services/missions'

let requestCounter = 0
let latestRequestId = 0

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isNewMissionRoute(missionId) {
  return !missionId || missionId === 'new'
}

function isValidMissionUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id)
}

function normalizeResponse(data) {
  return {
    actionPlan: data.actionPlan,
    risks: data.risks,
    tools: data.tools
  }
}

export function useMission(missionId) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(() => !isNewMissionRoute(missionId))
  const [error, setError] = useState('')
  const [result, setResult] = useState({ actionPlan: [], risks: [], tools: [] })
  const [activeStep, setActiveStep] = useState(0)

  const loadGen = useRef(0)

  const resetMissionState = useCallback(() => {
    setInput('')
    setResult({ actionPlan: [], risks: [], tools: [] })
    setError('')
    setLoading(false)
    setActiveStep(0)
  }, [])

  useEffect(() => {
    if (isNewMissionRoute(missionId)) {
      resetMissionState()
      setBootstrapping(false)
      return
    }

    if (!isValidMissionUuid(missionId)) {
      resetMissionState()
      setError('Invalid mission id')
      setBootstrapping(false)
      return
    }

    const gen = ++loadGen.current
    const supabase = getBrowserSupabase()

    ;(async () => {
      setBootstrapping(true)
      setError('')
      const { description, error: loadErr } = await fetchMissionById(
        supabase,
        missionId
      )

      if (gen !== loadGen.current) return

      if (loadErr) {
        setError(loadErr.message)
        setInput('')
        setResult({ actionPlan: [], risks: [], tools: [] })
        setActiveStep(0)
        setBootstrapping(false)
        return
      }

      setInput(description ?? '')
      setResult({ actionPlan: [], risks: [], tools: [] })
      setActiveStep(0)
      setBootstrapping(false)
    })()
  }, [missionId, resetMissionState])

  const canSubmit =
    input.trim().length > 0 && !loading && !bootstrapping

  async function onSubmit(e) {
    e.preventDefault()
    if (loading || bootstrapping) return

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
    bootstrapping,
    error,
    result,
    canSubmit,
    onSubmit
  }
}
