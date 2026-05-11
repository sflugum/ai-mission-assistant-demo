import { Routes, Route } from 'react-router-dom'
import { AnalyzeFlowProvider } from './context/AnalyzeFlowContext.jsx'
import DemoDisclaimer from './components/DemoDisclaimer.jsx'
import LandingPage from './components/LandingPage.jsx'
import ResultsPage from './components/ResultsPage.jsx'
import MissionSelector from './components/mission/MissionSelector.tsx'
import MissionWorkspacePage from './components/MissionWorkspacePage.jsx'

/** Top-level routes + shared analyze flow; bottom padding reserves space for the fixed legal strip. */
export default function App() {
  return (
    <AnalyzeFlowProvider>
      {/* Skip link targets `#main-content` on each page shell (see LandingPage, ResultsPage, etc.). */}
      <a
        href="#main-content"
        className="pointer-events-none fixed left-6 top-0 z-[200] block -translate-y-full rounded-lg bg-highlight px-4 py-3 font-sans text-sm font-semibold text-surface opacity-0 shadow-lg ring-2 ring-accent transition-transform transition-opacity motion-reduce:transition-none focus:pointer-events-auto focus:translate-y-4 focus:opacity-100 focus:outline-none focus-visible:outline-none"
      >
        Skip to main content
      </a>
      <div className="min-h-screen pb-[13rem] sm:pb-48 md:pb-44">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/missions" element={<MissionSelector />} />
          <Route path="/mission/:missionId" element={<MissionWorkspacePage />} />
        </Routes>
      </div>
      <DemoDisclaimer />
    </AnalyzeFlowProvider>
  )
}
