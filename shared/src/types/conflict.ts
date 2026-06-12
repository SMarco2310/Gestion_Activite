export type ConflictStatus = 'en_attente' | 'resolu' | 'ignore'
export type ConflictResolution = 'retire' | 'remplace' | 'ignore'

export interface Conflict {
  id: string
  activityId: string
  activityTitle: string
  conflictingActivityId: string
  conflictingActivityTitle: string
  conflictingActivityDates: string
  conflictingDepartment: string
  participantName: string
  status: ConflictStatus 
  resolution: ConflictResolution | null
  resolvedBy: string | null
  replacementName: string | null
  replacementRole: string | null
  detectedAt: string
  resolvedAt: string | null
}
