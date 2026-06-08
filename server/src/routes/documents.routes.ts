import { Router } from 'express'
import { uploadDocument, extractDocument, deleteDocument } from '../controllers/documents.controller'
import { authenticate } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router = Router()

router.use(authenticate)

router.post('/upload', upload.single('file'), uploadDocument)
router.post('/extract', upload.single('file'), extractDocument)
router.delete('/:id', deleteDocument)

export default router
