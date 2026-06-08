export interface Document {
  id: string
  activityId: string
  filename: string
  storagePath: string
  mimeType: string
  fileSizeBytes: number
  aiExtracted: boolean
  extractedFields: ExtractedFields | null
  uploadedBy: string
  uploadedAt: string
  downloadUrl?: string
}

export interface ExtractedFields {
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
