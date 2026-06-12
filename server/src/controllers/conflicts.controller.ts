import { Response } from 'express'
import crypto from 'crypto'
import { query, queryOne, withTransaction } from '../lib/db'
import { canMutateActivity } from '../lib/authz'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const getConflicts = async (req: AuthRequest, res: Response) => {
  try {
    const conflicts = await query(
      `SELECT c.*,
        json_build_object('title', a.title, 'startDate', a."startDate", 'endDate', a."endDate", 'department', a.department) AS activity,
        json_build_object('title', ca.title, 'startDate', ca."startDate", 'endDate', ca."endDate", 'department', ca.department) AS "conflictingActivity"
       FROM conflicts c
       JOIN activities a ON a.id = c."activityId"
       JOIN activities ca ON ca.id = c."conflictingActivityId"
       WHERE c.status = 'en_attente'
       ORDER BY c."detectedAt" DESC`
    )
    res.json({ success: true, data: conflicts, total: conflicts.length })
  } catch (error) {
    logger.error('GetConflicts error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const getActivityConflicts = async (req: AuthRequest, res: Response) => {
  try {
    const conflicts = await query(
      `SELECT c.*,
        json_build_object('title', ca.title, 'startDate', ca."startDate", 'endDate', ca."endDate", 'department', ca.department) AS "conflictingActivity"
       FROM conflicts c
       JOIN activities ca ON ca.id = c."conflictingActivityId"
       WHERE c."activityId" = $1
       ORDER BY c."detectedAt" DESC`,
      [req.params.activityId]
    )
    res.json({ success: true, data: conflicts })
  } catch (error) {
    logger.error('GetActivityConflicts error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const resolveConflict = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const { resolution, replacementName, replacementRole } = req.body

    const conflict = await queryOne<{ id: string; activityId: string; participantName: string; submittedById: string }>(
      `SELECT c.id, c."activityId", c."participantName", a."submittedById"
       FROM conflicts c JOIN activities a ON a.id = c."activityId"
       WHERE c.id = $1`,
      [id]
    )
    if (!conflict) return res.status(404).json({ success: false, error: 'Conflit non trouvé' })
    if (!canMutateActivity(conflict.submittedById, req.user!)) {
      return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à arbitrer ce conflit' })
    }

    await withTransaction(async (client) => {
      // Update conflict status
      await client.query(
        `UPDATE conflicts
         SET status = 'resolu', resolution = $1::"ConflictResolution", "resolvedBy" = $2,
             "resolvedAt" = now(), "replacementName" = $3, "replacementRole" = $4
         WHERE id = $5`,
        [resolution, req.user!.fullName, replacementName || null, replacementRole || null, id]
      )

      // Handle the participant change
      if (resolution === 'retire') {
        await client.query(
          `UPDATE activity_participants SET "availabilityStatus" = 'disponible'
           WHERE "activityId" = $1 AND "fullName" = $2`,
          [conflict.activityId, conflict.participantName]
        )
      } else if (resolution === 'remplace' && replacementName) {
        await client.query(
          `UPDATE activity_participants
           SET "fullName" = $1, "titleRole" = $2, "availabilityStatus" = 'nouveau', "isManuallyAdded" = true
           WHERE "activityId" = $3 AND "fullName" = $4`,
          [replacementName, replacementRole || '', conflict.activityId, conflict.participantName]
        )
      }

      // Write history
      await client.query(
        `INSERT INTO activity_history (id, "activityId", "eventType", "actorName", metadata)
         VALUES ($1, $2, 'conflit_resolu', $3, $4::jsonb)`,
        [
          crypto.randomUUID(),
          conflict.activityId,
          req.user!.fullName,
          JSON.stringify({ resolution, participantName: conflict.participantName, replacementName }),
        ]
      )
    })

    logger.info('Conflict resolved', { conflictId: id, resolution, resolvedBy: req.user!.id })
    res.json({ success: true, message: 'Conflit résolu' })
  } catch (error) {
    logger.error('ResolveConflict error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la résolution' })
  }
}
