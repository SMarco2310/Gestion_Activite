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
  createdAt: Date
}

export const signUp = async (req: Request, res: Response) => {
  try {
    const { fullName, email, password } = req.body

    const existing = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE email = $1',
      [email]
    )
    if (existing) {
      return res.status(409).json({ success: false, error: 'Un compte avec cet email existe déjà' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const id = crypto.randomUUID()

    await execute(
      `INSERT INTO users (id, "fullName", email, "passwordHash", "verificationToken", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, now())`,
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

    if (!user.emailVerified) {
      return res.status(403).json({ success: false, error: 'Veuillez vérifier votre email avant de vous connecter' })
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      logger.warn('Failed login attempt', { email })
      return res.status(401).json({ success: false, error: 'Identifiants incorrects' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.fullName },
      process.env.JWT_SECRET!,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    )

    logger.info('User logged in', { userId: user.id })
    res.json({
      success: true,
      data: { token, user: { id: user.id, fullName: user.fullName, email: user.email, role: user.role } },
    })
  } catch (error) {
    logger.error('SignIn error', { error })
    res.status(500).json({ success: false, error: 'Erreur lors de la connexion' })
  }
}

export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.params

    const user = await queryOne<{ id: string }>(
      'SELECT id FROM users WHERE "verificationToken" = $1',
      [token]
    )
    if (!user) {
      return res.status(400).json({ success: false, error: 'Lien de vérification invalide ou expiré' })
    }

    await execute(
      `UPDATE users
       SET "emailVerified" = true, "emailVerifiedAt" = now(), "verificationToken" = NULL, "updatedAt" = now()
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
