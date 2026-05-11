import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { analyzeMission } from '../controllers/missionController.js'

const router = Router()

// asyncHandler forwards rejected promises / thrown values to the global error middleware.
router.post('/analyze', asyncHandler(analyzeMission))

export default router
