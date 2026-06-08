import { Router } from 'express'
import {
  getActivities, getActivity, createActivity,
  updateActivity, deleteActivity, getCalendarActivities,
  exportActivityPdf, exportActivityExcel,
} from '../controllers/activities.controller'
import { authenticate } from '../middleware/auth.middleware'
import { validate } from '../middleware/validate.middleware'
import { createActivitySchema, updateActivitySchema } from '@gestiactivites/shared'

const router = Router()

router.use(authenticate)

router.get('/', getActivities)
router.get('/calendar', getCalendarActivities)
router.get('/:id', getActivity)
router.post('/', validate(createActivitySchema), createActivity)
router.patch('/:id', validate(updateActivitySchema), updateActivity)
router.delete('/:id', deleteActivity)
router.get('/:id/export/pdf', exportActivityPdf)
router.get('/:id/export/excel', exportActivityExcel)

export default router
