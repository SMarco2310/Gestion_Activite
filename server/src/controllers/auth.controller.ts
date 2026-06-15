import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { query, queryOne, execute } from '../lib/db'
import { emailService } from '../services/email.service'
import logger from '../lib/logger'
import { AuthRequest } from '../middleware/auth.middleware'

interface UserRow {
  id: string
  fullName: string
  email: string
  passwordHash: string
  role: string
  emailVerified: boolean
  failedLoginAttempts: number
  lockedUntil: Date | null
  createdAt: Date
}

const MAX_LOGIN_ATTEMPTS = 5
const LOCK_MINUTES = 15
const MAGIC_LINK_TTL_MIN = 15
const VERIFICATION_TTL_HOURS = 24

const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex')

function issueToken(user: { id: string; email: string; role: string }) {
  return jwt.sign(
    { id: user.id, role: user.role, username: user.email.split('@')[0] },
    process.env.JWT_SECRET!,
    { expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'] }
  )
}

export const signUp = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body

    const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email])
    if (existing) {
      return res.status(409).json({ success: false, error: 'Un compte avec cet email existe déjà' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const id = crypto.randomUUID()

    await execute(
      `INSERT INTO users (id, "fullName", email, "passwordHash", "verificationToken", "verificationTokenExpiresAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, now() + interval '${VERIFICATION_TTL_HOURS} hours', now())`,
      [id, fullName, email, passwordHash, verificationToken]
    )

    await emailService.sendVerificationEmail(email, fullName, verificationToken)

    logger.info('User registered', { userId: id, email })
    res.status(201).json({
      success: true,
      message: 'Compte créé. Vérifiez votre email pour activer votre compte.',
    })
  } catch (error) {
    logger.error('SignUp error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la création du compte' })
  }
}

export const signIn = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    const user = await queryOne<UserRow>('SELECT * FROM users WHERE email = $1', [email])
    if (!user) {
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' })
    }

    // Account lockout — block before checking the password to stop brute force.
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      const mins = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 60000)
      return res.status(429).json({ success: false, error: `Compte temporairement verrouillé. Réessayez dans ${mins} minute(s).` })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      const attempts = (user.failedLoginAttempts ?? 0) + 1
      if (attempts >= MAX_LOGIN_ATTEMPTS) {
        await execute(
          `UPDATE users SET "failedLoginAttempts" = 0, "lockedUntil" = now() + interval '${LOCK_MINUTES} minutes', "updatedAt" = now() WHERE id = $1`,
          [user.id]
        )
        logger.warn('Account locked after repeated failures', { userId: user.id })
        return res.status(429).json({ success: false, error: `Trop de tentatives. Compte verrouillé ${LOCK_MINUTES} minutes.` })
      }
      await execute('UPDATE users SET "failedLoginAttempts" = $1, "updatedAt" = now() WHERE id = $2', [attempts, user.id])
      logger.warn('Failed login attempt', { email, attempts })
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' })
    }

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, error: 'Veuillez vérifier votre email avant de vous connecter' })
    }

    // Success — clear any failure counters.
    await execute('UPDATE users SET "failedLoginAttempts" = 0, "lockedUntil" = NULL, "updatedAt" = now() WHERE id = $1', [user.id])

    logger.info('User logged in', { userId: user.id })
    res.json({
      success: true,
      data: { token: issueToken(user), user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
    })
  } catch (error) {
    logger.error('SignIn error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' })
  }
}

// ─── Magic-link (passwordless) login ────────────────────────────────

export const requestMagicLink = async (req: Request, res: Response) => {
  try {
    const { email } = req.body
    const user = await queryOne<{ id: string; fullName: string; emailVerified: boolean }>(
      'SELECT id, "fullName", "emailVerified" FROM users WHERE email = $1',
      [email]
    )

    // Only send to existing, verified accounts — but always return the same
    // response so attackers can't enumerate registered emails.
    if (user && user.emailVerified) {
      const raw = crypto.randomBytes(32).toString('hex')
      await execute(
        `UPDATE users SET "magicLinkTokenHash" = $1, "magicLinkExpiresAt" = now() + interval '${MAGIC_LINK_TTL_MIN} minutes', "updatedAt" = now() WHERE id = $2`,
        [sha256(raw), user.id]
      )
      try {
        await emailService.sendMagicLink(email, user.fullName, raw)
      } catch {
        // Swallow delivery errors so we don't leak account existence; log only.
      }
      if (process.env.NODE_ENV !== 'production') {
        logger.info('Magic link (dev)', { url: `${process.env.APP_URL}/auth/magic?token=${raw}` })
      }
    }

    res.json({ success: true, message: 'Si un compte existe pour cet email, un lien de connexion vous a été envoyé.' })
  } catch (error) {
    logger.error('RequestMagicLink error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}

export const verifyMagicLink = async (req: Request, res: Response) => {
  try {
    const { token } = req.body
    if (!token) return res.status(400).json({ success: false, error: 'Lien invalide' })

    const user = await queryOne<UserRow>(
      'SELECT * FROM users WHERE "magicLinkTokenHash" = $1 AND "magicLinkExpiresAt" > now()',
      [sha256(token)]
    )
    if (!user) {
      return res.status(400).json({ success: false, error: 'Lien de connexion invalide ou expiré' })
    }

    // Single-use: clear the token; also clear any lockout and mark verified.
    await execute(
      `UPDATE users
       SET "magicLinkTokenHash" = NULL, "magicLinkExpiresAt" = NULL,
           "failedLoginAttempts" = 0, "lockedUntil" = NULL,
           "emailVerified" = true, "emailVerifiedAt" = COALESCE("emailVerifiedAt", now()),
           "updatedAt" = now()
       WHERE id = $1`,
      [user.id]
    )

    logger.info('User logged in via magic link', { userId: user.id })
    res.json({
      success: true,
      data: { token: issueToken(user), user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
    })
  } catch (error) {
    logger.error('VerifyMagicLink error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' })
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    const user = await queryOne<{ id: string; verificationTokenExpiresAt: Date | null }>(
      'SELECT id, "verificationTokenExpiresAt" FROM users WHERE "verificationToken" = $1',
      [token]
    )
    if (!user) {
      return res.status(400).json({ success: false, error: 'Lien de vérification invalide' })
    }
    if (user.verificationTokenExpiresAt && new Date(user.verificationTokenExpiresAt) < new Date()) {
      return res.status(400).json({ success: false, error: 'Lien de vérification expiré' })
    }

    await execute(
      `UPDATE users
       SET "emailVerified" = true, "emailVerifiedAt" = now(),
           "verificationToken" = NULL, "verificationTokenExpiresAt" = NULL, "updatedAt" = now()
       WHERE id = $1`,
      [user.id]
    )

    logger.info('Email verified', { userId: user.id })
    res.redirect(`${process.env.APP_URL}/login?verified=true`)
  } catch (error) {
    logger.error('VerifyEmail error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la vérification' })
  }
}

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    const rows = await query(
      'SELECT id, "fullName", email, role, "createdAt" FROM users WHERE id = $1',
      [req.user!.id]
    )
    res.json({ success: true, data: rows[0] ?? null })
  } catch (error) {
    logger.error('GetMe error', { error })
    res.status(500).json({ success: false, error: 'Erreur serveur' })
  }
}
