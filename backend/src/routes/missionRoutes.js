import { Router } from 'express'
import {
  createMission,
  replaceMission,
  getMissions,
  getMissionById,
  deleteMission
} from '../controllers/missionController.js'

// Simple wrapper to pass async errors to errorMiddleware
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next)
}

const router = Router()

// Mission CRUD
router.get('/missions', asyncHandler(getMissions))
router.post('/missions', asyncHandler(createMission))
router.get('/missions/:id', asyncHandler(getMissionById))
router.put('/missions/:id', asyncHandler(replaceMission))
router.delete('/missions/:id', asyncHandler(deleteMission))

export default router