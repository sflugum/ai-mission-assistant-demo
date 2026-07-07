import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchMissionById } from '../services/missions'
import { experimental_useObject as useObject } from '@ai-sdk/react'

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
  const [bootstrapping, setBootstrapping] = useState(() => !isNewMissionRoute(missionId))
  const [fetchError, setFetchError] = useState('')
  const [showSaveOffer, setShowSaveOffer] = useState(false)
  
  // Holds data loaded from the Postgres database
  const [savedResult, setSavedResult] = useState({ actionPlan: [], risks: [], tools: [] })

  const loadGen = useRef(0)

  // 1. Initialize the AI SDK stream
  const { submit, isLoading: aiLoading, object, error: aiError } = useObject({
    api: '/api/generate-plan',
    onFinish: ({ object }) => {
      if (object && hasAnalysisRows(object)) {
        setShowSaveOffer(true)
      }
    }
  })

  const resetMissionState = useCallback(() => {
    setInput('')
    setSavedResult({ actionPlan: [], risks: [], tools: [] })
    setFetchError('')
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
      setFetchError('Invalid mission id')
      setBootstrapping(false)
      return
    }

    const gen = ++loadGen.current
    const snapshot = location.state?.savedSnapshot

    if (snapshot && typeof snapshot === 'object' && typeof snapshot.description === 'string') {
      setInput(snapshot.description)
      setSavedResult({
        actionPlan: snapshot.actionPlan ?? [],
        risks: snapshot.risks ?? [],
        tools: snapshot.tools ?? []
      })
    }

    ;(async () => {
      try {
        setBootstrapping(true)
        setFetchError('')

        const detail = await fetchMissionById(missionId)
        if (gen !== loadGen.current) return

        if (detail.error) {
          setFetchError(detail.error.message)
          resetMissionState()
          setBootstrapping(false)
          return
        }

        setInput(detail.description ?? '')
        setSavedResult({
          actionPlan: detail.actionPlan ?? [],
          risks: detail.risks ?? [],
          tools: detail.tools ?? []
        })
        setShowSaveOffer(false)
        setBootstrapping(false)
      } catch (err) {
        if (gen !== loadGen.current) return
        setFetchError(err?.message || 'Failed to load mission')
        resetMissionState()
        setBootstrapping(false)
      }
    })()
  }, [missionId, resetMissionState, location.state])

  // 2. Combine state for the UI
  const loading = aiLoading || bootstrapping
  const error = fetchError || aiError?.message || ''
  
  // If the AI is actively streaming (or finished), use `object`. 
  // Otherwise, fall back to what was loaded from Postgres.
  const activeData = (object && Object.keys(object).length > 0) ? object : savedResult

  // 3. Ensure UI components always receive arrays, even during partial chunk parses
  const result = {
    actionPlan: activeData?.actionPlan || [],
    risks: activeData?.risks || [],
    tools: activeData?.tools || []
  }

  const canSubmit = input.trim().length > 0 && !loading && !bootstrapping

  async function onSubmit(e) {
    e.preventDefault()
    if (loading || bootstrapping) return

    setFetchError('')
    setShowSaveOffer(false)
    
    // 4. Trigger the edge function
    submit({ prompt: input })
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