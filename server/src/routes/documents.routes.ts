import { Router, type Router as RouterType } from 'express'
import rateLimit from 'express-rate-limit'
import { uploadDocument, extractDocument, deleteDocument } from '../controllers/documents.controller'
import { authenticate } from '../middleware/auth.middleware'
import { upload } from '../middleware/upload.middleware'

const router: RouterType = Router()

// AI extraction calls the Anthropic API (real cost) — throttle hard per IP.
const extractLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 15,
  message: { success: false, error: 'Trop d\'extractions — réessayez plus tard' },
})

router.use(authenticate)

router.post('/upload', upload.single('file'), uploadDocument)
router.post('/extract', extractLimiter, upload.single('file'), extractDocument)
router.delete('/:id', deleteDocument)

export default router
