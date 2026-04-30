import Header from './components/Header.jsx'
import MissionInput from './components/MissionInput.jsx'
import RequirementDisplay from './components/RequirementDisplay.jsx'
import { useMission } from './hooks/useMission.js'

export default function App() {
  const { input, setInput, loading, error, result, canSubmit, onSubmit } = useMission()

  return (
    <div className="min-h-screen">
      <Header />

      <main className="mx-auto max-w-4xl px-4 py-8">
        <MissionInput
          input={input}
          onInputChange={setInput}
          onSubmit={onSubmit}
          loading={loading}
          error={error}
          canSubmit={canSubmit}
        />

        <RequirementDisplay result={result} loading={loading} />
      </main>
    </div>
  )
}
