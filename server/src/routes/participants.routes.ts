import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import { addParticipant, updateParticipant, removeParticipant } from '../controllers/participants.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'

const router: RouterType = Router()

const addParticipantSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis'),
  titleRole: z.string().min(1, 'Le titre / rôle est requis'),
  participantType: z.enum(['participant', 'facilitateur']).optional(),
})

const updateParticipantSchema = z.object({
  fullName: z.string().min(2, 'Le nom est requis'),
  titleRole: z.string().min(1, 'Le titre / rôle est requis'),
})

router.use(authenticate)

router.post('/activities/:activityId/participants', validate(addParticipantSchema), addParticipant)
router.patch('/activities/:activityId/participants/:participantId', validate(updateParticipantSchema), updateParticipant)
router.delete('/activities/:activityId/participants/:participantId', removeParticipant)

export default router
