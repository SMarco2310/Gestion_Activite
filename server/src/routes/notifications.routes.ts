import { Router, type Router as RouterType } from 'express'
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notifications.controller'
import { authenticate } from '../middleware/auth.middleware'

const router: RouterType = Router()

router.use(authenticate)

router.get('/', getNotifications)
router.patch('/:id/read', markAsRead)
router.patch('/read-all', markAllAsRead)

export default router
