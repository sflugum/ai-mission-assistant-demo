import { useParams } from 'react-router-dom'
import Header from './Header.jsx'
import MissionInput from './MissionInput.jsx'
import RequirementDisplay from './RequirementDisplay.jsx'
import { useMission } from '../hooks/useMission.js'

function MissionWorkspaceInner({ missionId }) {
  const {
    input,
    setInput,
    loading,
    bootstrapping,
    error,
    result,
    canSubmit,
    onSubmit
  } = useMission(missionId)

  return (
    <div className="min-h-screen">
      <Header homeLink="/" />

      <main className="mx-auto max-w-4xl px-4 py-8">
        {bootstrapping ? (
          <p className="text-sm text-slate-400">Loading mission…</p>
        ) : (
          <>
            <MissionInput
              input={input}
              onInputChange={setInput}
              onSubmit={onSubmit}
              loading={loading}
              error={error}
              canSubmit={canSubmit}
            />

            <RequirementDisplay result={result} loading={loading} />
          </>
        )}
      </main>
    </div>
  )
}

/** Remount on `missionId` change so local session state cannot bleed across missions. */
export default function MissionWorkspace() {
  const { missionId } = useParams()
  return <MissionWorkspaceInner key={missionId} missionId={missionId} />
}
