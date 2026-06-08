import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { Activity, ActivityDetail, CreateActivityInput, UpdateActivityInput } from '@gestiactivites/shared'

export const useActivities = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['activities', params],
    queryFn: async () => {
      const { data } = await api.get('/activities', { params })
      return data as { data: Activity[]; total: number }
    },
  })

export const useActivity = (id: string) =>
  useQuery({
    queryKey: ['activity', id],
    queryFn: async () => {
      const { data } = await api.get(`/activities/${id}`)
      return data.data as ActivityDetail
    },
    enabled: !!id,
  })

export const useCreateActivity = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (input: CreateActivityInput) => {
      const { data } = await api.post('/activities', input)
      return data
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['activities'] }),
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
