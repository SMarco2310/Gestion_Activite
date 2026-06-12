import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/axios'
import type { ApiNotification } from '../lib/api'

export const useNotifications = () =>
  useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications')
      return data as { data: ApiNotification[]; unreadCount: number }
    },
    refetchInterval: 60000,
  })

export const useMarkRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}

export const useMarkAllRead = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.patch('/notifications/read-all'),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['notifications'] }),
  })
}
