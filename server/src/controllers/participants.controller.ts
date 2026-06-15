import { Response } from 'express'
import crypto from 'crypto'
import { queryOne, execute } from '../lib/db'
import { conflictService } from '../services/conflict.service'
import { getActivityOwner, denyIfCannotMutate } from '../lib/authz'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

/** Returns true if it already sent a 403/404 response. */
async function denyIfNotOwner(activityId: string, req: AuthRequest, res: Response): Promise<boolean> {
  const owner = await getActivityOwner(activityId)
  return denyIfCannotMutate(res, owner, req.user!, 'mutate participants', 'Vous n\'êtes pas autorisé à modifier les participants de cette activité')
}

export const addParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId } = req.params
    if (await denyIfNotOwner(activityId as string, req, res)) return
    const { fullName, titleRole, participantType = 'participant' } = req.body

    const participant = await queryOne(
      `INSERT INTO activity_participants
        (id, "activityId", "fullName", "titleRole", "participantType", "isManuallyAdded")
       VALUES ($1, $2, $3, $4, $5::"ParticipantType", true)
       RETURNING *`,
      [crypto.randomUUID(), activityId, fullName, titleRole, participantType]
    )

    await conflictService.detectConflicts(activityId as string, req.user!.id)
    res.status(201).json({ success: true, data: participant })
  } catch (error) {
    logger.error('AddParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const updateParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId, participantId } = req.params
    if (await denyIfNotOwner(activityId as string, req, res)) return
    const { fullName, titleRole } = req.body

    // Scope the update to the activity in the URL so a participant id from another
    // activity can't be targeted.
    const participant = await queryOne(
      `UPDATE activity_participants SET "fullName" = $1, "titleRole" = $2
       WHERE id = $3 AND "activityId" = $4 RETURNING *`,
      [fullName, titleRole, participantId, activityId]
    )
    if (!participant) return res.status(404).json({ success: false, error: 'Participant non trouvé' })
    res.json({ success: true, data: participant })
  } catch (error) {
    logger.error('UpdateParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const removeParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId, participantId } = req.params
    if (await denyIfNotOwner(activityId as string, req, res)) return
    await execute(
      'DELETE FROM activity_participants WHERE id = $1 AND "activityId" = $2',
      [participantId, activityId]
    )
    res.json({ success: true, message: 'Participant retiré' })
  } catch (error) {
    logger.error('RemoveParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
