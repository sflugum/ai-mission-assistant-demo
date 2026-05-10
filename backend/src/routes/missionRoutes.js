import { Router } from 'express'
import asyncHandler from 'express-async-handler'
import { analyzeMission } from '../controllers/missionController.js'

const router = Router()

router.post('/analyze', asyncHandler(analyzeMission))

export default router
