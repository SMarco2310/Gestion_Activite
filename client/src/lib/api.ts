// Real API response shapes (the server returns more/other fields than the
// aspirational types in @gestiactivites/shared — these match the controllers).
import { DEPTS } from './mock'

export type ApiActivityStatus = 'brouillon' | 'soumis' | 'actif' | 'termine' | 'archive'
export type ApiActivityType = 'atelier' | 'formation' | 'mission' | 'reunion' | 'autre'
export type ApiAvailability = 'disponible' | 'conflit' | 'nouveau'

export interface ApiActivityBase {
  id: string
  submittedById: string
  title: string
  referenceNumber: string | null
  type: ApiActivityType
  department: string
  startDate: string
  endDate: string
  venue: string
  status: ApiActivityStatus
  isUrgent: boolean
  submittedAt: string
  createdAt: string
  updatedAt: string
}

export interface ApiActivityListItem extends ApiActivityBase {
  submittedBy: { fullName: string }
  _count: { participants: number; conflictsAsMain: number }
}

export interface ApiParticipant {
  id: string
  activityId: string
  fullName: string
  titleRole: string
  participantType: 'participant' | 'facilitateur'
  availabilityStatus: ApiAvailability
  isManuallyAdded: boolean
  createdAt: string
}

export interface ApiDocument {
  id: string
  activityId: string
  filename: string
  storagePath: string
  mimeType: string
  fileSizeBytes: number
  aiExtracted: boolean
  extractedFields: Record<string, unknown> | null
  uploadedBy: string
  uploadedAt: string
  downloadUrl?: string
}

export interface ApiHistoryEvent {
  id: string
  activityId: string
  eventType: string
  actorName: string
  metadata: Record<string, unknown>
  occurredAt: string
}

export interface ApiConflictActivityEmbed {
  title: string
  startDate: string
  endDate: string
  department: string
}

export interface ApiActivityConflict {
  id: string
  activityId: string
  conflictingActivityId: string
  participantName: string
  status: 'en_attente' | 'resolu' | 'ignore'
  resolution: 'retire' | 'remplace' | 'ignore' | null
  resolvedBy: string | null
  replacementName: string | null
  replacementRole: string | null
  detectedAt: string
  resolvedAt: string | null
  conflictingActivity: ApiConflictActivityEmbed
}

export interface ApiActivityDetail extends ApiActivityBase {
  submittedBy: { fullName: string; email: string }
  participants: ApiParticipant[]
  documents: ApiDocument[]
  history: ApiHistoryEvent[]
  conflictsAsMain: ApiActivityConflict[]
}

// /conflicts list adds the main activity embed alongside the conflicting one.
export interface ApiConflict extends ApiActivityConflict {
  activity: ApiConflictActivityEmbed
}

export interface ApiCalendarActivity {
  id: string
  title: string
  department: string
  startDate: string
  endDate: string
  status: ApiActivityStatus
  _count: { conflictsAsMain: number }
}

export interface ApiNotification {
  id: string
  userId: string
  activityId: string | null
  type: string
  message: string
  isRead: boolean
  createdAt: string
  readAt: string | null
}

export interface ApiExtractedFields {
  title?: string
  referenceNumber?: string
  type?: string
  department?: string
  startDate?: string
  endDate?: string
  venue?: string
  participants?: Array<{ fullName: string; titleRole: string }>
  facilitators?: Array<{ fullName: string; titleRole: string; organisation?: string }>
}

export interface ApiMe {
  id: string
  fullName: string
  email: string
  role: string
  createdAt: string
}

// ─── Display helpers ────────────────────────────────────────────────

export const STATUS_LABEL: Record<ApiActivityStatus, string> = {
  brouillon: 'Brouillon',
  soumis: 'Soumis',
  actif: 'Actif',
  termine: 'Terminé',
  archive: 'Archivé',
}

export const TYPE_LABEL: Record<ApiActivityType, string> = {
  atelier: 'Atelier',
  formation: 'Formation',
  mission: 'Mission',
  reunion: 'Réunion',
  autre: 'Autre',
}

const FALLBACK_DEPT = { short: '—', name: '', color: '#64748B', bg: '#F1F5F9', line: '#E2E8F0' }
export function deptMeta(code: string) {
  return (DEPTS as Record<string, typeof FALLBACK_DEPT>)[code] || { ...FALLBACK_DEPT, short: code || '—', name: code }
}

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']

export function fmtDate(iso?: string | null) {
  if (!iso) return '—'
  const [y, m, d] = iso.split('-')
  return `${d} ${MONTHS_FR[Number(m) - 1]} ${y}`
}

export function fmtRange(start?: string | null, end?: string | null) {
  if (!start) return '—'
  const [ys, ms, ds] = start.split('-')
  if (!end || end === start) return fmtDate(start)
  const [ye, me, de] = end.split('-')
  if (ys === ye && ms === me) return `${ds} – ${de} ${MONTHS_FR[Number(ms) - 1]} ${ye}`
  return `${fmtDate(start)} – ${fmtDate(end)}`
}

export function fmtDateTime(iso?: string | null) {
  if (!iso) return '—'
  const d = new Date(iso)
  return `${String(d.getDate()).padStart(2, '0')} ${MONTHS_FR[d.getMonth()]} ${d.getFullYear()}`
}

export const STATUS_FILTERS: ApiActivityStatus[] = ['brouillon', 'soumis', 'actif', 'termine']
