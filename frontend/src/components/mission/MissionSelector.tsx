import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import {
  deleteSavedMission,
  fetchSavedMissions,
  type SavedMissionRow
} from '../../services/missions'
import {
  heroBtnPrimaryClass,
  heroBtnSecondaryClass,
  MarketingHeroTagline,
  MissionMarketingHero
} from './MissionMarketingHero'

const btnResumeCard =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-primary bg-white px-4 py-2 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 active:bg-primary/15 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-[3px]'

const btnDeleteCard =
  'inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border-2 border-secondary bg-white px-4 py-2 text-sm font-semibold text-secondary transition-colors hover:bg-secondary/10 active:bg-secondary/15 disabled:pointer-events-none disabled:opacity-50 outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-accent focus-visible:outline-offset-[3px]'

function formatUpdatedAt(iso: string): string {
  try {
    const d = new Date(iso)
    if (Number.isNaN(d.getTime())) return '—'
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short'
    })
  } catch {
    return '—'
  }
}

type MissionsLocationState = { focusSaved?: boolean }

export default function MissionSelector() {
  const navigate = useNavigate()
  const location = useLocation()
  const [missions, setMissions] = useState<SavedMissionRow[]>([])
  const [listLoading, setListLoading] = useState(true)
  const [listError, setListError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    ;(async () => {
      setListLoading(true)
      setListError(null)
      
      const { data, error } = await fetchSavedMissions()
      if (cancelled) return
      
      if (error) {
        setListError(error.message)
        setMissions([])
      } else {
        setMissions(data)
      }
      setListLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [location.pathname, location.key])

  useEffect(() => {
    const state = location.state as MissionsLocationState | null
    if (!state?.focusSaved) return

    document.getElementById('saved-missions')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })

    navigate('.', { replace: true, state: {} })
  }, [location.state, navigate])

  function scrollToSaved() {
    document.getElementById('saved-missions')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    })
  }

  async function handleDeleteMission(m: SavedMissionRow) {
    const rawTitle = (m.title ?? '').trim() || 'Untitled mission'
    const label = rawTitle.length > 72 ? `${rawTitle.slice(0, 72)}…` : rawTitle
    if (!window.confirm(`Delete "${label}"? This cannot be undone.`)) return

    setDeleteError(null)
    setDeletingId(m.id)

    const { error } = await deleteSavedMission(m.id)
    setDeletingId(null)

    if (error) {
      setDeleteError(error.message)
      return
    }

    setMissions((prev) => prev.filter((row) => row.id !== m.id))
  }
}
