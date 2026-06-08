import { Response } from 'express'
import crypto from 'crypto'
import { queryOne, execute } from '../lib/db'
import { conflictService } from '../services/conflict.service'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const addParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { activityId } = req.params
    const { fullName, titleRole, participantType = 'participant' } = req.body

    const participant = await queryOne(
      `INSERT INTO activity_participants
        (id, "activityId", "fullName", "titleRole", "participantType", "isManuallyAdded")
       VALUES ($1, $2, $3, $4, $5::"ParticipantType", true)
       RETURNING *`,
      [crypto.randomUUID(), activityId, fullName, titleRole, participantType]
    )

    await conflictService.detectConflicts(activityId, req.user!.id)
    res.status(201).json({ success: true, data: participant })
  } catch (error) {
    logger.error('AddParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const updateParticipant = async (req: AuthRequest, res: Response) => {
  try {
    const { participantId } = req.params
    const { fullName, titleRole } = req.body

    const participant = await queryOne(
      `UPDATE activity_participants SET "fullName" = $1, "titleRole" = $2 WHERE id = $3 RETURNING *`,
      [fullName, titleRole, participantId]
    )
    res.json({ success: true, data: participant })
  } catch (error) {
    logger.error('UpdateParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const removeParticipant = async (req: AuthRequest, res: Response) => {
  try {
    await execute('DELETE FROM activity_participants WHERE id = $1', [req.params.participantId])
    res.json({ success: true, message: 'Participant retiré' })
  } catch (error) {
    logger.error('RemoveParticipant error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
