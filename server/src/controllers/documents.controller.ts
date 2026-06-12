import { Response } from 'express'
import { documentService } from '../services/document.service'
import { queryOne } from '../lib/db'
import { getActivityOwner, canMutateActivity } from '../lib/authz'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

export const uploadDocument = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, error: 'Fichier requis' })
    const { activityId } = req.body
    if (!activityId) return res.status(400).json({ success: false, error: 'activityId requis' })

    const owner = await getActivityOwner(activityId)
    if (owner == null) return res.status(404).json({ success: false, error: 'Activité non trouvée' })
    if (!canMutateActivity(owner, req.user!)) {
      return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à ajouter un document à cette activité' })
    }

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
    const doc = await queryOne<{ activityId: string }>(
      'SELECT "activityId" FROM documents WHERE id = $1',
      [req.params.id]
    )
    if (!doc) return res.status(404).json({ success: false, error: 'Document non trouvé' })

    const owner = await getActivityOwner(doc.activityId)
    if (!canMutateActivity(owner, req.user!)) {
      return res.status(403).json({ success: false, error: 'Vous n\'êtes pas autorisé à supprimer ce document' })
    }

    await documentService.delete(req.params.id as string)
    res.json({ success: true, message: 'Document supprimé' })
  } catch (error) {
    logger.error('DeleteDocument error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
