import { queryOne } from './db'

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
