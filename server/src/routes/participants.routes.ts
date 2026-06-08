import { Router } from 'express'
import { addParticipant, updateParticipant, removeParticipant } from '../controllers/participants.controller'
import { authenticate } from '../middleware/auth.middleware'

const router = Router()

router.use(authenticate)

router.post('/activities/:activityId/participants', addParticipant)
router.patch('/activities/:activityId/participants/:participantId', updateParticipant)
router.delete('/activities/:activityId/participants/:participantId', removeParticipant)

export default router
