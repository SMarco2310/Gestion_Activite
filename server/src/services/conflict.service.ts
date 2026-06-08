import crypto from 'crypto'
import { query, queryOne, withTransaction } from '../lib/db'
import logger from '../lib/logger'

interface DetectedConflict {
  participantName: string
  conflictingActivityId: string
}

export const conflictService = {
  async detectConflicts(activityId: string, submittedById: string): Promise<DetectedConflict[]> {
    const activity = await queryOne<{ id: string; startDate: string; endDate: string }>(
      'SELECT id, "startDate", "endDate" FROM activities WHERE id = $1',
      [activityId]
    )
    if (!activity) return []

    const participantRows = await query<{ fullName: string }>(
      `SELECT "fullName" FROM activity_participants
       WHERE "activityId" = $1 AND "participantType" = 'participant'`,
      [activityId]
    )
    if (participantRows.length === 0) return []

    const participantNames = participantRows.map((p) => p.fullName)

    // Find every participant of another non-archived activity whose date range
    // overlaps this one and whose name matches one of our participants.
    const conflicts = await query<DetectedConflict>(
      `SELECT ov.id AS "conflictingActivityId", p."fullName" AS "participantName"
       FROM activities ov
       JOIN activity_participants p ON p."activityId" = ov.id
       WHERE ov.id <> $1
         AND ov.status NOT IN ('archive', 'brouillon')
         AND ov."startDate" <= $2::date
         AND ov."endDate" >= $3::date
         AND p."participantType" = 'participant'
         AND p."fullName" = ANY($4::text[])`,
      [activityId, activity.endDate, activity.startDate, participantNames]
    )

    if (conflicts.length === 0) return []

    const conflictingNames = [...new Set(conflicts.map((c) => c.participantName))]

    await withTransaction(async (client) => {
      // Clear old unresolved conflicts for this activity
      await client.query(
        `DELETE FROM conflicts WHERE "activityId" = $1 AND status = 'en_attente'`,
        [activityId]
      )

      // Create new conflicts
      for (const c of conflicts) {
        await client.query(
          `INSERT INTO conflicts (id, "activityId", "conflictingActivityId", "participantName")
           VALUES ($1, $2, $3, $4)`,
          [crypto.randomUUID(), activityId, c.conflictingActivityId, c.participantName]
        )
      }

      // Update participant availability status
      await client.query(
        `UPDATE activity_participants SET "availabilityStatus" = 'conflit'
         WHERE "activityId" = $1 AND "fullName" = ANY($2::text[])`,
        [activityId, conflictingNames]
      )

      // Write history event
      await client.query(
        `INSERT INTO activity_history (id, "activityId", "eventType", "actorName", metadata)
         VALUES ($1, $2, 'conflit_detecte', 'Système', $3::jsonb)`,
        [crypto.randomUUID(), activityId, JSON.stringify({ conflicts: conflicts.map((c) => c.participantName) })]
      )

      // Create notifications for the submitter
      for (const c of conflicts) {
        await client.query(
          `INSERT INTO notifications (id, "userId", "activityId", type, message)
           VALUES ($1, $2, $3, 'conflit_detecte', $4)`,
          [
            crypto.randomUUID(),
            submittedById,
            activityId,
            `Conflit détecté : ${c.participantName} est déjà inscrit(e) à une autre activité sur la même période.`,
          ]
        )
      }
    })

    logger.warn('Conflicts detected', {
      activityId,
      count: conflicts.length,
      participants: conflicts.map((c) => c.participantName),
    })
    return conflicts
  },
}
