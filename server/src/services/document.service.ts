import crypto from 'crypto'
import { supabase, STORAGE_BUCKET } from '../lib/supabase'
import { anthropic } from '../lib/anthropic'
import { queryOne, execute } from '../lib/db'
import logger from '../lib/logger'
import type { ExtractedFields } from '@gestiactivites/shared'

export const documentService = {
  async upload(file: Express.Multer.File, activityId: string, uploadedById: string) {
    const filename = `${activityId}/${Date.now()}-${file.originalname}`

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filename, file.buffer, { contentType: file.mimetype })

    if (error) throw new Error(`Storage upload failed: ${error.message}`)

    const document = await queryOne<{ id: string }>(
      `INSERT INTO documents
        (id, "activityId", "uploadedById", filename, "storagePath", "mimeType", "fileSizeBytes")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [crypto.randomUUID(), activityId, uploadedById, file.originalname, filename, file.mimetype, file.size]
    )

    logger.info('Document uploaded', { documentId: document?.id, activityId })
    return document
  },

  async extractWithAI(file: Express.Multer.File): Promise<ExtractedFields> {
    const base64 = file.buffer.toString('base64')

    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [{
        role: 'user',
        content: [
          {
            type: 'document',
            source: { type: 'base64', media_type: 'application/pdf', data: base64 },
          },
          {
            type: 'text',
            text: `Extract the following fields from this TDR document and return ONLY valid JSON with no markdown:
{
  "title": "activity title",
  "referenceNumber": "document reference number",
  "type": "one of: atelier, formation, mission, reunion, autre",
  "department": "organising department name",
  "startDate": "YYYY-MM-DD",
  "endDate": "YYYY-MM-DD",
  "venue": "location",
  "participants": [{"fullName": "name", "titleRole": "role"}],
  "facilitators": [{"fullName": "name", "titleRole": "role", "organisation": "org"}]
}
Use null for fields you cannot find.`,
          },
        ],
      }],
    })

    const text = message.content.find((b) => b.type === 'text')?.text || '{}'
    try {
      return JSON.parse(text.replace(/```json|```/g, '').trim()) as ExtractedFields
    } catch {
      logger.warn('AI extraction JSON parse failed', { raw: text })
      return {}
    }
  },

  async delete(documentId: string) {
    const doc = await queryOne<{ storagePath: string }>(
      'SELECT "storagePath" FROM documents WHERE id = $1',
      [documentId]
    )
    if (!doc) throw new Error('Document not found')

    await supabase.storage.from(STORAGE_BUCKET).remove([doc.storagePath])
    await execute('DELETE FROM documents WHERE id = $1', [documentId])
    logger.info('Document deleted', { documentId })
  },
}
