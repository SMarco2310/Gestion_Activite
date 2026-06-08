import { Response } from 'express'
import { query, execute } from '../lib/db'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const notifications = await query<{ isRead: boolean }>(
      `SELECT * FROM notifications WHERE "userId" = $1 ORDER BY "createdAt" DESC LIMIT 50`,
      [req.user!.id]
    )
    const unreadCount = notifications.filter((n) => !n.isRead).length
    res.json({ success: true, data: notifications, unreadCount })
  } catch (error) {
    logger.error('GetNotifications error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await execute(
      `UPDATE notifications SET "isRead" = true, "readAt" = now() WHERE id = $1 AND "userId" = $2`,
      [req.params.id, req.user!.id]
    )
    res.json({ success: true })
  } catch (error) {
    logger.error('MarkAsRead error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    await execute(
      `UPDATE notifications SET "isRead" = true, "readAt" = now() WHERE "userId" = $1 AND "isRead" = false`,
      [req.user!.id]
    )
    res.json({ success: true })
  } catch (error) {
    logger.error('MarkAllAsRead error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
