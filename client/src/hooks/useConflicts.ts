import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { ResolveConflictInput } from '@gestiactivites/shared'
import type { ApiConflict, ApiActivityConflict } from '../lib/api'

export const useConflicts = () =>
  useQuery({
    queryKey: ['conflicts'],
    queryFn: async () => {
      const { data } = await api.get('/conflicts')
      return data as { data: ApiConflict[]; total: number }
    },
    refetchInterval: 30000,
  })

export const useActivityConflicts = (activityId?: string) =>
  useQuery({
    queryKey: ['conflicts', activityId],
    queryFn: async () => {
      const { data } = await api.get(`/conflicts/activity/${activityId}`)
      return data.data as ApiActivityConflict[]
    },
    enabled: !!activityId,
  })

export const useResolveConflict = (activityId?: string) => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ conflictId, input }: { conflictId: string; input: ResolveConflictInput }) => {
      const { data } = await api.patch(`/conflicts/${conflictId}/resolve`, input)
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['conflicts'] })
      qc.invalidateQueries({ queryKey: ['activities'] })
      if (activityId) qc.invalidateQueries({ queryKey: ['activity', activityId] })
    },
  })
}
