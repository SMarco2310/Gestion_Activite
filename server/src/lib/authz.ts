import type { Response } from 'express'
import { queryOne } from './db'
import logger from './logger'

/** Returns the submitter (owner) id of an activity, or null if it doesn't exist. */
export async function getActivityOwner(activityId: string): Promise<string | null> {
  const row = await queryOne<{ submittedById: string }>(
    'SELECT "submittedById" FROM activities WHERE id = $1',
    [activityId]
  )
  return row?.submittedById ?? null
}

/** A user may mutate a resource if they are an admin or the activity's owner. */
export function canMutateActivity(ownerId: string | null, user: { id: string; role: string }): boolean {
  if (ownerId == null) return false
  return user.role === 'admin' || ownerId === user.id
}

/**
 * Guard for mutating routes. Sends 404 (missing) or 403 (forbidden) and returns
 * `true` if the request was denied; the caller should `return` in that case.
 * Logs every authorization denial for monitoring (OWASP A09).
 */
export function denyIfCannotMutate(
  res: Response,
  ownerId: string | null,
  user: { id: string; role: string },
  action: string,
  forbiddenMessage = 'Vous n\'êtes pas autorisé à effectuer cette action'
): boolean {
  if (ownerId == null) {
    res.status(404).json({ success: false, error: 'Ressource non trouvée' })
    return true
  }
  if (!canMutateActivity(ownerId, user)) {
    logger.warn('Authorization denied', { userId: user.id, role: user.role, action, ownerId })
    res.status(403).json({ success: false, error: forbiddenMessage })
    return true
  }
  return false
}
