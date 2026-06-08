export type NotificationType = 'conflit_detecte' | 'conflit_resolu' | 'activite_soumise'

export interface Notification {
  id: string
  userId: string
  activityId: string
  activityTitle: string
  type: NotificationType
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}
