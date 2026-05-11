import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState
} from 'react'
import { analyzeMissionNormalized } from '../services/analyzeNormalized.js'

const AnalyzeFlowContext = createContext(null)

let requestSeq = 0
let latestStartedRequestId = 0

export function AnalyzeFlowProvider({ children }) {
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState({
    actionPlan: [],
    risks: [],
    tools: []
  })

  const submitAnalyze = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault()
    if (!input.trim() || loading) return false

    const requestId = ++requestSeq
    latestStartedRequestId = requestId

    // eslint-disable-next-line no-console
    console.debug('[analyze-flow] start', {
      requestId,
      startedAt: new Date().toISOString()
    })

    setError('')
    setLoading(true)

    try {
      const normalized = await analyzeMissionNormalized(input)

      if (requestId !== latestStartedRequestId) {
        // eslint-disable-next-line no-console
        console.debug('[analyze-flow] stale response ignored', {
          requestId,
          latestStartedRequestId,
          arrivedAt: new Date().toISOString()
        })
        return false
      }

      // eslint-disable-next-line no-console
      console.debug('[analyze-flow] response applied', {
        requestId,
        arrivedAt: new Date().toISOString()
      })

      setResult(normalized)
      return true
    } catch (err) {
      if (requestId !== latestStartedRequestId) {
        return false
      }
      setError(err?.message || 'Something went wrong.')
      return false
    } finally {
      if (requestId === latestStartedRequestId) {
        // eslint-disable-next-line no-console
        console.debug('[analyze-flow] finish', {
          requestId,
          finishedAt: new Date().toISOString(),
          loading: false
        })
        setLoading(false)
      }
    }
  }, [input, loading])

  const resetSession = useCallback(() => {
    setInput('')
    setResult({ actionPlan: [], risks: [], tools: [] })
    setError('')
    setLoading(false)
  }, [])

  const canSubmit = input.trim().length > 0 && !loading

  const value = useMemo(
    () => ({
      input,
      setInput,
      loading,
      error,
      result,
      canSubmit,
      submitAnalyze,
      resetSession
    }),
    [
      input,
      loading,
      error,
      result,
      canSubmit,
      submitAnalyze,
      resetSession
    ]
  )

  return (
    <AnalyzeFlowContext.Provider value={value}>
      {children}
    </AnalyzeFlowContext.Provider>
  )
}

export function useAnalyzeFlow() {
  const ctx = useContext(AnalyzeFlowContext)
  if (!ctx) {
    throw new Error('useAnalyzeFlow must be used within AnalyzeFlowProvider')
  }
  return ctx
}
