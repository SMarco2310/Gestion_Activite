import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ParticipantDraft {
  id: string
  status: 'Disponible' | 'Conflit' | 'Nouveau'
  ext?: { name: string; role: string }
}

export interface ActivityDraftFields {
  title: string
  dept: string
  type: string
  start: string
  end: string
  venue: string
  ref: string
  urgent: boolean
}

interface ActivityDraftState {
  view: 'gate' | 'upload' | 'verify' | 'form' | 'success'
  step: number
  fields: ActivityDraftFields
  participants: ParticipantDraft[]
  hasFile: boolean
  fileName: string
  autofilled: Record<string, boolean> | null

  setView: (view: ActivityDraftState['view']) => void
  setStep: (step: number) => void
  setFields: (fields: Partial<ActivityDraftFields>) => void
  setParticipants: (p: ParticipantDraft[]) => void
  setFile: (hasFile: boolean, fileName: string) => void
  setAutofilled: (af: Record<string, boolean> | null) => void
  clearDraft: () => void
}

const DEFAULT_FIELDS: ActivityDraftFields = {
  title: '', dept: 'INH', type: 'Atelier',
  start: '', end: '', venue: '', ref: '', urgent: false,
}

export const useActivityDraftStore = create<ActivityDraftState>()(
  persist(
    (set) => ({
      view: 'gate',
      step: 1,
      fields: DEFAULT_FIELDS,
      participants: [],
      hasFile: false,
      fileName: '',
      autofilled: null,
      setView: (view) => set({ view }),
      setStep: (step) => set({ step }),
      setFields: (fields) => set((s) => ({ fields: { ...s.fields, ...fields } })),
      setParticipants: (participants) => set({ participants }),
      setFile: (hasFile, fileName) => set({ hasFile, fileName }),
      setAutofilled: (autofilled) => set({ autofilled }),
      clearDraft: () => set({ view: 'gate', step: 1, fields: DEFAULT_FIELDS, participants: [], hasFile: false, fileName: '', autofilled: null }),
    }),
    { name: 'gestiactivites-activity-draft' }
  )
)
