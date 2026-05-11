import { Routes, Route } from 'react-router-dom'
import { AnalyzeFlowProvider } from './context/AnalyzeFlowContext.jsx'
import LandingPage from './components/LandingPage.jsx'
import ResultsPage from './components/ResultsPage.jsx'
import MissionSelector from './components/mission/MissionSelector.tsx'
import MissionWorkspacePage from './components/MissionWorkspacePage.jsx'

export default function App() {
  return (
    <AnalyzeFlowProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/missions" element={<MissionSelector />} />
        <Route path="/mission/:missionId" element={<MissionWorkspacePage />} />
      </Routes>
    </AnalyzeFlowProvider>
  )
}
