import { Router } from 'express'
import { signUp, signIn, verifyEmail, getMe } from '../controllers/auth.controller'
import { validate } from '../middleware/validate.middleware'
import { authenticate } from '../middleware/auth.middleware'
import { signUpSchema, signInSchema } from '@gestiactivites/shared'
import rateLimit from 'express-rate-limit'

const router = Router()

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, error: 'Trop de tentatives — réessayez dans 15 minutes' },
})

router.post('/signup', authLimiter, validate(signUpSchema), signUp)
router.post('/login', authLimiter, validate(signInSchema), signIn)
router.get('/verify/:token', verifyEmail)
router.get('/me', authenticate, getMe)

export default router
