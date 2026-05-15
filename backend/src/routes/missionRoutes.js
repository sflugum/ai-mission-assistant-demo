import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import {
  analyzeMission,
  createMission,
  replaceMission
} from '../controllers/missionController.js'

const router = Router()

// asyncHandler forwards rejected promises / thrown values to the global error middleware.
router.post('/analyze', asyncHandler(analyzeMission))
router.post('/missions', asyncHandler(createMission))
router.put('/missions/:id', asyncHandler(replaceMission))

export default router
