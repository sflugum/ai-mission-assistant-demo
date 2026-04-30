import { Router } from 'express'
import { analyzeMission } from '../controllers/missionController.js'

const router = Router()

router.post('/analyze', analyzeMission)

export default router
