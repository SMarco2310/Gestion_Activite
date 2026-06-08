import { Resend } from 'resend'

export const resend = new Resend(process.env.RESEND_API_KEY!)

export const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@sante.gouv.tg'
export const APP_URL = process.env.APP_URL || 'http://localhost:5173'
