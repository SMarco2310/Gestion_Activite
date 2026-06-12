import { Response } from 'express'
import crypto from 'crypto'
import { query, queryOne, execute, withTransaction } from '../lib/db'
import { conflictService } from '../services/conflict.service'
import { exportService } from '../services/export.service'
import { getActivityOwner, canMutateActivity } from '../lib/authz'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const getActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { status, department, from, to, page = '1', limit = '20' } = req.query

    const conditions: string[] = []
    const params: unknown[] = []
    if (status) {
      params.push(status)
      conditions.push(`a.status = $${params.length}::"ActivityStatus"`)
    }
    if (department) {
      params.push(department)
      conditions.push(`a.department ILIKE '%' || $${params.length} || '%'`)
    }
    if (from) {
      params.push(from)
      conditions.push(`a."startDate" >= $${params.length}::date`)
    }
    if (to) {
      params.push(to)
      conditions.push(`a."startDate" <= $${params.length}::date`)
    }
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : ''

    const pageNum = parseInt(page as string)
    const limitNum = parseInt(limit as string)
    const offset = (pageNum - 1) * limitNum

    const listParams = [...params, limitNum, offset]
    const [activities, countRow] = await Promise.all([
      query(
        `SELECT a.*,
          json_build_object('fullName', u."fullName") AS "submittedBy",
          json_build_object(
            'participants', (SELECT count(*)::int FROM activity_participants p WHERE p."activityId" = a.id),
            'conflictsAsMain', (SELECT count(*)::int FROM conflicts c WHERE c."activityId" = a.id AND c.status = 'en_attente')
          ) AS "_count"
         FROM activities a
         JOIN users u ON u.id = a."submittedById"
         ${where}
         ORDER BY a."createdAt" DESC
         LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
        listParams
      ),
      queryOne<{ total: number }>(
        `SELECT count(*)::int AS total FROM activities a ${where}`,
        params
      ),
    ])

    res.json({ success: true, data: activities, total: countRow?.total ?? 0, page: pageNum })
  } catch (error) {
    logger.error('GetActivities error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const getActivity = async (req: AuthRequest, res: Response) => {
  try {
    const activity = await queryOne(
      `SELECT a.*,
        json_build_object('fullName', u."fullName", 'email', u.email) AS "submittedBy",
        COALESCE((
          SELECT json_agg(p ORDER BY p."availabilityStatus" ASC, p."fullName" ASC)
          FROM activity_participants p WHERE p."activityId" = a.id
        ), '[]'::json) AS participants,
        COALESCE((
          SELECT json_agg(d) FROM documents d WHERE d."activityId" = a.id
        ), '[]'::json) AS documents,
        COALESCE((
          SELECT json_agg(h ORDER BY h."occurredAt" ASC)
          FROM activity_history h WHERE h."activityId" = a.id
        ), '[]'::json) AS history,
        COALESCE((
          SELECT json_agg(json_build_object(
            'id', c.id, 'activityId', c."activityId", 'conflictingActivityId', c."conflictingActivityId",
            'participantName', c."participantName", 'status', c.status, 'resolution', c.resolution,
            'resolvedBy', c."resolvedBy", 'replacementName', c."replacementName", 'replacementRole', c."replacementRole",
            'detectedAt', c."detectedAt", 'resolvedAt', c."resolvedAt",
            'conflictingActivity', json_build_object(
              'title', ca.title, 'startDate', ca."startDate", 'endDate', ca."endDate", 'department', ca.department
            )
          ) ORDER BY c."detectedAt" DESC)
          FROM conflicts c
          JOIN activities ca ON ca.id = c."conflictingActivityId"
          WHERE c."activityId" = a.id AND c.status = 'en_attente'
        ), '[]'::json) AS "conflictsAsMain"
       FROM activities a
       JOIN users u ON u.id = a."submittedById"
       WHERE a.id = $1`,
      [req.params.id]
    )

    if (!activity) return res.status(404).json({ success: false, error: 'Activité non trouvée' })
    res.json({ success: true, data: activity })
  } catch (error) {
    logger.error('GetActivity error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const createActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { participants, facilitators, ...activityData } = req.body

    const activityId = crypto.randomUUID()

    const activity = await withTransaction(async (client) => {
      const inserted = await client.query(
        `INSERT INTO activities
          (id, "submittedById", title, "referenceNumber", type, department, "startDate", "endDate", venue, status, "isUrgent", "submittedAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7::date, $8::date, $9, 'soumis', $10, now(), now())
         RETURNING *`,
        [
          activityId,
          req.user!.id,
          activityData.title,
          activityData.referenceNumber ?? null,
          activityData.type,
          activityData.department,
          activityData.startDate,
          activityData.endDate,
          activityData.venue,
          activityData.isUrgent ?? false,
        ]
      )

      const allParticipants = [
        ...((participants || []) as Array<{ fullName: string; titleRole: string }>).map((p) => ({
          fullName: p.fullName,
          titleRole: p.titleRole,
          participantType: 'participant',
        })),
        ...((facilitators || []) as Array<{ fullName: string; titleRole: string }>).map((f) => ({
          fullName: f.fullName,
          titleRole: f.titleRole,
          participantType: 'facilitateur',
        })),
      ]

      for (const p of allParticipants) {
        await client.query(
          `INSERT INTO activity_participants (id, "activityId", "fullName", "titleRole", "participantType")
           VALUES ($1, $2, $3, $4, $5::"ParticipantType")`,
          [crypto.randomUUID(), activityId, p.fullName, p.titleRole, p.participantType]
        )
      }

      await client.query(
        `INSERT INTO activity_history (id, "activityId", "eventType", "actorName", metadata)
         VALUES ($1, $2, 'cree', $3, '{}'::jsonb)`,
        [crypto.randomUUID(), activityId, req.user!.fullName]
      )

      const createdParticipants = await client.query(
        'SELECT * FROM activity_participants WHERE "activityId" = $1',
        [activityId]
      )

      return { ...inserted.rows[0], participants: createdParticipants.rows }
    })

    // Run conflict detection (own transaction) after the activity is committed
    const conflicts = await conflictService.detectConflicts(activityId, req.user!.id)
    logger.info('Activity created', { activityId, conflicts: conflicts.length })

    res.status(201).json({ success: true, data: activity, conflicts })
  } catch (error) {
    logger.error('CreateActivity error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la création' })
  }
}

// Columns the client is allowed to update directly.
const UPDATABLE_COLUMNS: Record<string, { date?: boolean }> = {
  title: {},
  referenceNumber: {},
  type: {},
  department: {},
  venue: {},
  status: {},
  isUrgent: {},
  startDate: { date: true },
  endDate: { date: true },
}

export const updateActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const updateData = req.body as Record<string, unknown>

    const existing = await queryOne<{ startDate: string; endDate: string; submittedById: string }>(
      'SELECT "startDate", "endDate", "submittedById" FROM activities WHERE id = $1',
      [id]
    )
    if (!existing) return res.status(404).json({ success: false, error: 'Activité non trouvée' })
    if (!canMutateActivity(existing.submittedById, req.user!)) {
      return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à modifier cette activité' })
    }

    const datesChanged =
      (updateData.startDate != null && updateData.startDate !== existing.startDate) ||
      (updateData.endDate != null && updateData.endDate !== existing.endDate)

    const setClauses: string[] = []
    const params: unknown[] = []
    for (const [key, meta] of Object.entries(UPDATABLE_COLUMNS)) {
      if (updateData[key] === undefined) continue
      params.push(updateData[key])
      setClauses.push(`"${key}" = $${params.length}${meta.date ? '::date' : ''}`)
    }

    const activity = await withTransaction(async (client) => {
      let row
      if (setClauses.length) {
        const result = await client.query(
          `UPDATE activities SET ${setClauses.join(', ')}, "updatedAt" = now() WHERE id = $${params.length + 1} RETURNING *`,
          [...params, id]
        )
        row = result.rows[0]
      } else {
        const result = await client.query('SELECT * FROM activities WHERE id = $1', [id])
        row = result.rows[0]
      }

      await client.query(
        `INSERT INTO activity_history (id, "activityId", "eventType", "actorName", metadata)
         VALUES ($1, $2, 'modifie', $3, $4::jsonb)`,
        [crypto.randomUUID(), id, req.user!.fullName, JSON.stringify(updateData)]
      )

      return row
    })

    // Re-run conflict detection if dates changed
    if (datesChanged) await conflictService.detectConflicts(id as string, req.user!.id)

    res.json({ success: true, data: activity })
  } catch (error) {
    logger.error('UpdateActivity error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la mise à jour' })
  }
}

export const deleteActivity = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params
    const owner = await getActivityOwner(id as string)
    if (owner == null) return res.status(404).json({ success: false, error: 'Activité non trouvée' })
    if (!canMutateActivity(owner, req.user!)) {
      return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à supprimer cette activité' })
    }
    await withTransaction(async (client) => {
      await client.query(
        `UPDATE activities SET status = 'archive', "updatedAt" = now() WHERE id = $1`,
        [id]
      )
      await client.query(
        `INSERT INTO activity_history (id, "activityId", "eventType", "actorName", metadata)
         VALUES ($1, $2, 'statut_change', $3, $4::jsonb)`,
        [crypto.randomUUID(), id, req.user!.fullName, JSON.stringify({ newStatus: 'archive' })]
      )
    })
    res.json({ success: true, message: 'Activité archivée' })
  } catch (error) {
    logger.error('DeleteActivity error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const getCalendarActivities = async (req: AuthRequest, res: Response) => {
  try {
    const { from, to } = req.query

    const conditions: string[] = [`a.status NOT IN ('archive', 'brouillon')`]
    const params: unknown[] = []
    if (from) {
      params.push(from)
      conditions.push(`a."startDate" >= $${params.length}::date`)
    }
    if (to) {
      params.push(to)
      conditions.push(`a."endDate" <= $${params.length}::date`)
    }

    const activities = await query(
      `SELECT a.id, a.title, a.department, a."startDate", a."endDate", a.status,
        json_build_object(
          'conflictsAsMain', (SELECT count(*)::int FROM conflicts c WHERE c."activityId" = a.id AND c.status = 'en_attente')
        ) AS "_count"
       FROM activities a
       WHERE ${conditions.join(' AND ')}`,
      params
    )
    res.json({ success: true, data: activities })
  } catch (error) {
    logger.error('GetCalendarActivities error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const exportActivityPdf = async (req: AuthRequest, res: Response) => {
  try {
    const pdf = await exportService.generatePdf(req.params.id as string)
    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="participants-${req.params.id}.pdf"`)
    res.send(pdf)
  } catch (error) {
    logger.error('ExportPdf error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la génération du PDF' })
  }
}

export const exportActivityExcel = async (req: AuthRequest, res: Response) => {
  try {
    const excel = await exportService.generateExcel(req.params.id as string)
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')
    res.setHeader('Content-Disposition', `attachment; filename="participants-${req.params.id}.xlsx"`)
    res.send(excel)
  } catch (error) {
    logger.error('ExportExcel error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la génération Excel' })
  }
}
