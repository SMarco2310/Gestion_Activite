import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { CreateActivityInput, UpdateActivityInput } from '@gestiactivites/shared'
import type { ApiActivityListItem, ApiActivityDetail, ApiCalendarActivity } from '../lib/api'

export const useActivities = (params?: Record<string, string | undefined>) =>
  useQuery({
    queryKey: ['activities', params],
    queryFn: async () => {
      const { data } = await api.get('/activities', { params })
      return data as { data: ApiActivityListItem[]; total: number; page: number }
    },
  })

export const useActivity = (id?: string) =>
  useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data } = await api.get(`/activities/${id}`)
      return data.data as ApiActivityDetail
    },
    enabled: !!id,
  })

export const useCalendarActivities = (params?: { from?: string; to?: string }) =>
  useQuery({
    queryKey: ['calendar', params],
    queryFn: async () => {
      const { data } = await api.get('/activities/calendar', { params })
      return data.data as ApiCalendarActivity[]
    },
  })

export const useCreateActivity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data } = await api.post('/activities', input)
      return data as { success: boolean; data: ApiActivityDetail; conflicts: { participantName: string; conflictingActivityId: string }[] }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
      qc.invalidateQueries({ queryKey: ['conflicts'] })
    },
  })
}

export const useUpdateActivity = (id: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: UpdateActivityInput) => {
      const { data } = await api.patch(`/activities/${id}`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activities'] })
      qc.invalidateQueries({ queryKey: ['activity', id] })
    },
  })
}

export const useDeleteActivity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await api.delete(`/activities/${id}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
  })
}

// ─── Participants (scoped to an activity) ───────────────────────────

export const useAddParticipant = (activityId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: { fullName: string; titleRole: string; participantType?: string }) => {
      const { data } = await api.post(`/participants/activities/${activityId}/participants`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['activity', activityId] })
      qc.invalidateQueries({ queryKey: ['conflicts'] })
    },
  })
}

export const useUpdateParticipant = (activityId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ participantId, ...input }: { participantId: string; fullName: string; titleRole: string }) => {
      const { data } = await api.patch(`/participants/activities/${activityId}/participants/${participantId}`, input)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity', activityId] }),
  })
}

export const useRemoveParticipant = (activityId: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (participantId: string) => {
      const { data } = await api.delete(`/participants/activities/${activityId}/participants/${participantId}`)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activity', activityId] }),
  })
}
