import { z } from 'zod'

const GOV_DOMAINS = ['sante.gouv.tg', 'inh.tg', 'mshpcsua.tg', 'pnlp.tg', 'dse.gouv.tg']

export const signUpSchema = z.object({
  fullName: z.string().min(3, 'Le nom complet est requis'),
  email: z
    .string()
    .email('Adresse email invalide')
    .refine(
      (email) => GOV_DOMAINS.some((domain) => email.endsWith(`@${domain}`)),
      'Seuls les emails gouvernementaux sont acceptés'
    ),
  password: z
    .string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .regex(/[A-Z]/, 'Au moins une lettre majuscule')
    .regex(/[0-9]/, 'Au moins un chiffre'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

export const signInSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
