import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { fetchMissionById } from '../services/missions'
import { experimental_useObject as useObject } from '@ai-sdk/react'

// Standard UUID v1-v8 pattern (version + variant nibbles pinned), used to
// tell a real mission id apart from the "new" route param.
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

/**
 * @param {string | undefined} missionId
 * @returns {boolean} true when the route is the "create new mission" state
 * (no id yet, or the literal "new" segment) rather than an existing mission.
 */  
function isNewMissionRoute(missionId) {
  return !missionId || missionId === 'new'
}

export function isValidMissionUuid(id) {
  return typeof id === 'string' && UUID_RE.test(id)
}

/**
 * @param {{ actionPlan?: string[], risks?: string[], tools?: string[] } | undefined} normalized
 * @returns {boolean} true if there's at least one row to show/save. Used to
 * decide whether it's worth offering a save prompt after the AI finishes
 * an empty or malformed response shouldn't trigger that.
 */
function hasAnalysisRows(normalized) {
  const a = normalized?.actionPlan?.length ?? 0
  const r = normalized?.risks?.length ?? 0
  const t = normalized?.tools?.length ?? 0
  return a + r + t > 0
}

/**
 * Loads an existing mission (by id) or sets up a blank "new mission" form,
 * and wires up the streaming AI analysis call for that mission's input.
 */
export function useMission(missionId) {
  const location = useLocation()
  const [input, setInput] = useState('')
  const [bootstrapping, setBootstrapping] = useState(() => !isNewMissionRoute(missionId))
  const [fetchError, setFetchError] = useState('')
  const [showSaveOffer, setShowSaveOffer] = useState(false)
  
  // Holds data loaded from the Postgres database
  const [savedResult, setSavedResult] = useState({ actionPlan: [], risks: [], tools: [] })

  // Bumped on every load attempt so an in-flight fetch that resolves after
  // the user has already navigated away (or re-triggered a load) can tell
  // its result is stale and skip updating state.
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

  // Same effect as dismissSaveOffer, but kept as its own function
  // since it's called from a different place (right after a successful
  // save, vs. the user clicking "Not now"). If the save-complete path
  // ever needs extra handling later, it won't have to be untangled from
  // the dismiss path.
  const acknowledgeSaveComplete = useCallback(() => {
    setShowSaveOffer(false)
  }, [])

  useEffect(() => {
    // Three cases handled below: a brand-new/unsaved mission (reset and
    // stop), an id that isn't even a valid UUID (show an error and stop),
    // or a real id worth fetching from the database.
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
    // Populated by MissionWorkspacePage's onSaveComplete handler, which
    // navigates here right after a save with the just-saved data attached.
    // Lets this mission render immediately instead of waiting on the
    // fetchMissionById round trip below.
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
        // Bail out if a newer load has started since this one kicked off.
        // Otherwise a slow response could overwrite state set by a later request.
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
  const error = fetchError || (aiError ? (aiError.message || 'An unknown error occurred.') : '')
  
  // If the AI is actively streaming (or finished), use `object`. 
  // Otherwise, fall back to what was loaded from Postgres.
  const activeData = (object && Object.keys(object).length > 0) ? object : savedResult

  // 3. Ensure UI components always receive arrays, even during partial chunk parses
  // (useObject can return a partially-parsed object mid-stream where a field
  // is still undefined, so this keeps consumers from having to null-check).
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