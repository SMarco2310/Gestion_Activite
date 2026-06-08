import { z } from 'zod'

const activityObject = z.object({
  title: z.string().min(3, 'Le titre est requis'),
  referenceNumber: z.string().optional(),
  type: z.enum(['atelier', 'formation', 'mission', 'reunion', 'autre']),
  department: z.string().min(1, 'Le département est requis'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format de date invalide (YYYY-MM-DD)'),
  venue: z.string().min(2, 'Le lieu est requis'),
  isUrgent: z.boolean().default(false),
  participants: z.array(z.object({
    fullName: z.string().min(2),
    titleRole: z.string().min(1),
  })).optional(),
  facilitators: z.array(z.object({
    fullName: z.string().min(2),
    titleRole: z.string().min(1),
    organisation: z.string().optional(),
  })).optional(),
})

export const createActivitySchema = activityObject.refine(
  (data) => new Date(data.startDate) <= new Date(data.endDate),
  { message: 'La date de fin doit être après la date de début', path: ['endDate'] }
)

export const updateActivitySchema = activityObject.omit({
  participants: true,
  facilitators: true,
}).partial()

export const resolveConflictSchema = z.object({
  resolution: z.enum(['retire', 'remplace', 'ignore']),
  replacementName: z.string().optional(),
  replacementRole: z.string().optional(),
}).refine(
  (data) => data.resolution !== 'remplace' || (data.replacementName && data.replacementName.length > 0),
  { message: 'Le nom du remplaçant est requis', path: ['replacementName'] }
)

export type CreateActivityInput = z.infer<typeof createActivitySchema>
export type UpdateActivityInput = z.infer<typeof updateActivitySchema>
export type ResolveConflictInput = z.infer<typeof resolveConflictSchema>
