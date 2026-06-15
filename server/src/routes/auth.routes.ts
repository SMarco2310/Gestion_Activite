import { Router, type Router as RouterType } from 'express'
import { z } from 'zod'
import { signUp, signIn, verifyEmail, getMe, requestMagicLink, verifyMagicLink } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate } from '../middleware/auth.middleware'
import { signUpSchema, signInSchema } from '@gestiactivites/shared'
import rateLimit from 'express-rate-limit'

const router: RouterType = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives — réessayez dans 15 minutes' },
})

const magicRequestSchema = z.object({ email: z.string().email('Adresse email invalide') })
const magicVerifySchema = z.object({ token: z.string().min(10, 'Lien invalide') })

router.post('/signup', authLimiter, validate(signUpSchema), signUp)
router.post('/login', authLimiter, validate(signInSchema), signIn)
router.post('/magic', authLimiter, validate(magicRequestSchema), requestMagicLink)
router.post('/magic/verify', authLimiter, validate(magicVerifySchema), verifyMagicLink)
router.get('/verify/:token', verifyEmail)
router.get('/me', authenticate, getMe)

export default router
