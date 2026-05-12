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
        className="sr-only focus:not-sr-only focus:pointer-events-auto focus:fixed focus:left-6 focus:top-4 focus:z-[200] focus:block focus:rounded-lg focus:bg-highlight focus:px-4 focus:py-3 focus:font-sans focus:text-sm focus:font-semibold focus:text-surface focus:ring-2 focus:ring-accent focus:ring-offset-2 antialiased"
      >
        Skip to main content
      </a>
      <div className="relative min-h-screen pb-52 sm:pb-48 md:pb-44">
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
