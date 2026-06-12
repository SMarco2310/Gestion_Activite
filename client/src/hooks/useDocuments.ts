import { useMutation } from '@tanstack/react-query'
import api from '../lib/axios'
import type { ApiExtractedFields } from '../lib/api'

/** Upload a TDR file and get AI-extracted fields back (not persisted). */
export const useExtractDocument = () =>
  useMutation({
    mutationFn: async (file: File) => {
      const form = new FormData()
      form.append('file', file)
      const { data } = await api.post('/documents/extract', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data as ApiExtractedFields
    },
  })

/** Persist a document against an activity. */
export const useUploadDocument = () =>
  useMutation({
    mutationFn: async ({ file, activityId }: { file: File; activityId: string }) => {
      const form = new FormData()
      form.append('file', file)
      form.append('activityId', activityId)
      const { data } = await api.post('/documents/upload', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      return data.data
    },
  })
