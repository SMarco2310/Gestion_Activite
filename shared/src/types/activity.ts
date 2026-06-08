export type ActivityStatus = 'brouillon' | 'soumis' | 'actif' | 'termine' | 'archive'
export type ActivityType = 'atelier' | 'formation' | 'mission' | 'reunion' | 'autre'

export interface Activity {
  id: string
  submittedBy: string
  submittedByName: string
  title: string
  referenceNumber: string
  type: ActivityType
  department: string
  startDate: string
  endDate: string
  venue: string
  status: ActivityStatus
  isUrgent: boolean
  conflictCount: number
  participantCount: number
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export interface ActivityDetail extends Activity {
  participants: import('./participant').Participant[]
  facilitators: import('./participant').Facilitator[]
  documents: import('./document').Document[]
  history: ActivityHistoryEvent[]
}

export interface ActivityHistoryEvent {
  id: string
  activityId: string
  eventType: 'cree' | 'soumis' | 'conflit_detecte' | 'conflit_resolu' | 'modifie' | 'statut_change'
  actorName: string
  metadata: Record<string, unknown>
  occurredAt: string
}
