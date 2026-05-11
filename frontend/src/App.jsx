import { Routes, Route } from 'react-router-dom'
import MissionSelector from './components/mission/MissionSelector.tsx'
import MissionWorkspace from './components/MissionWorkspace.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<MissionSelector />} />
      <Route path="/mission/:missionId" element={<MissionWorkspace />} />
    </Routes>
  )
}
