export type AvailabilityStatus = 'disponible' | 'conflit' | 'nouveau'
export type ParticipantType = 'participant' | 'facilitateur'

export interface Participant {
  id: string
  activityId: string
  fullName: string
  titleRole: string
  participantType: ParticipantType
  availabilityStatus: AvailabilityStatus
  isManuallyAdded: boolean
  createdAt: string
}

export interface Facilitator {
  id: string
  activityId: string
  fullName: string
  titleRole: string
  organisation: string
  createdAt: string
}
