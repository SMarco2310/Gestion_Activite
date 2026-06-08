import { Response } from 'express'
import { documentService } from '../services/document.service'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Fichier requis' })
    const { activityId } = req.body
    const document = await documentService.upload(req.file, activityId, req.user!.id)
    res.status(201).json({ success: true, data: document })
  } catch (error) {
    logger.error('UploadDocument error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors du téléversement' })
  }
}

export const extractDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Fichier requis' })
    const extracted = await documentService.extractWithAI(req.file)
    res.json({ success: true, data: extracted })
  } catch (error) {
    logger.error('ExtractDocument error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de l\'extraction' })
  }
}

export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    await documentService.delete(req.params.id)
    res.json({ success: true, message: 'Document supprimé' })
  } catch (error) {
    logger.error('DeleteDocument error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
