import { resend, EMAIL_FROM, APP_URL } from '../lib/resend'
import logger from '../lib/logger'

export const emailService = {
  async sendVerificationEmail(email: string, fullName: string, token: string) {
    const verifyUrl = `${APP_URL.replace('5173', '3001')}/api/auth/verify/${token}`
    try {
      await resend.emails.send({
        from: EMAIL_FROM,
        to: email,
        subject: 'Activez votre compte GestiActivités',
        html: `
          <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;">
            <h2 style="color:#185FA5;">GestiActivités</h2>
            <p>Bonjour ${fullName},</p>
            <p>Cliquez sur le lien ci-dessous pour activer votre compte :</p>
            <a href="${verifyUrl}" style="display:inline-block;padding:12px 24px;background:#185FA5;color:white;text-decoration:none;border-radius:6px;margin:16px 0;">
              Activer mon compte
            </a>
            <p style="color:#666;font-size:13px;">Ce lien expire dans 24 heures.</p>
            <p style="color:#666;font-size:13px;">Ministère de la Santé et de l'Hygiène Publique — République Togolaise</p>
          </div>
        `,
      })
      logger.info('Verification email sent', { email })
    } catch (error) {
      logger.error('Failed to send verification email', { email, error })
      throw error
    }
  },
}
