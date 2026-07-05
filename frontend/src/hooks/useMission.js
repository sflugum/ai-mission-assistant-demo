import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { analyzeMissionNormalized } from '../services/analyzeNormalized.js'
import { fetchMissionById } from '../services/missions'

let requestCounter = 0
let latestRequestId = 0

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isNewMissionRoute(missionId) {
  return !missionId || missionId === 'new'
}

export function isValidMissionUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id)
}

function hasAnalysisRows(normalized) {
  const a = normalized?.actionPlan?.length ?? 0
  const r = normalized?.risks?.length ?? 0
  const t = normalized?.tools?.length ?? 0
  return a + r + t > 0
}

export function useMission(missionId) {
  const location = useLocation()
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [bootstrapping, setBootstrapping] = useState(() => !isNewMissionRoute(missionId))
  const [error, setError] = useState('')
  const [result, setResult] = useState({ actionPlan: [], risks: [], tools: [] })
  const [showSaveOffer, setShowSaveOffer] = useState(false)

  const loadGen = useRef(0)

  const resetMissionState = useCallback(() => {
    setInput('')
    setResult({ actionPlan: [], risks: [], tools: [] })
    setError('')
    setLoading(false)
    setShowSaveOffer(false)
  }, [])

  const dismissSaveOffer = useCallback(() => {
    setShowSaveOffer(false)
  }, [])

  const acknowledgeSaveComplete = useCallback(() => {
    setShowSaveOffer(false)
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

    const snapshot = location.state?.savedSnapshot
    if (
      snapshot &&
      typeof snapshot === 'object' &&
      typeof snapshot.description === 'string'
    ) {
      setInput(snapshot.description)
      setResult({
        actionPlan: snapshot.actionPlan ?? [],
        risks: snapshot.risks ?? [],
        tools: snapshot.tools ?? []
      })
    }

    ; (async () => {
      try {
        setBootstrapping(true)
        setError('')

        const detail = await fetchMissionById(missionId)

        if (gen !== loadGen.current) return

        if (detail.error) {
          setError(detail.error.message)
          setInput('')
          setResult({ actionPlan: [], risks: [], tools: [] })
          setShowSaveOffer(false)
          setBootstrapping(false)
          return
        }

        setInput(detail.description ?? '')
        setResult({
          actionPlan: detail.actionPlan ?? [],
          risks: detail.risks ?? [],
          tools: detail.tools ?? []
        })
        setShowSaveOffer(false)
        setBootstrapping(false)
      } catch (err) {
        if (gen !== loadGen.current) return
        setError(err?.message || 'Failed to load mission')
        setInput('')
        setResult({ actionPlan: [], risks: [], tools: [] })
        setShowSaveOffer(false)
        setBootstrapping(false)
      }
    })()
  }, [missionId, resetMissionState, location.state])

  const canSubmit =
    input.trim().length > 0 && !loading && !bootstrapping

  async function onSubmit(e) {
    e.preventDefault()
    if (loading || bootstrapping) return

    const requestId = ++requestCounter
    latestRequestId = requestId

    setError('')
    setLoading(true)

    try {
      const normalized = await analyzeMissionNormalized(input)

      if (requestId !== latestRequestId) {
        return
      }

      setResult(normalized)
      setShowSaveOffer(hasAnalysisRows(normalized))
    } catch (err) {
      if (requestId !== latestRequestId) {
        return
      }
      setError(err?.message || 'Something went wrong.')
    } finally {
      if (requestId === latestRequestId) {
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
    onSubmit,
    showSaveOffer,
    dismissSaveOffer,
    acknowledgeSaveComplete
  }
}