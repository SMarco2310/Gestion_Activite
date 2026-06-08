import { Router } from 'express'
import { getConflicts, getActivityConflicts, resolveConflict } from '../controllers/conflicts.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { resolveConflictSchema } from '@gestiactivites/shared'

const router = Router()

router.use(authenticate)

router.get('/', getConflicts)
router.get('/activity/:activityId', getActivityConflicts)
router.patch('/:id/resolve', validate(resolveConflictSchema), resolveConflict)

export default router
