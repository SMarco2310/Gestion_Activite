import { useMutation } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import api from '../lib/axios'
import { useAuthStore } from '../store/authStore'
import type { SignInInput, SignUpInput } from '@gestiactivites/shared'

export const useSignIn = () => {
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  return useMutation({
    mutationFn: async (input: SignInInput) => {
      const { data } = await api.post('/auth/login', input)
      return data
    },
    onSuccess: (data) => {
      setAuth(data.data.token, data.data.user)
      navigate('/dashboard')
    },
    onError: () => toast.error('Identifiants incorrects'),
  })
}

export const useSignUp = () => {
  const navigate = useNavigate()
  return useMutation({
    mutationFn: async (input: SignUpInput) => {
      const { data } = await api.post('/auth/signup', input)
      return data
    },
    onSuccess: () => navigate('/verify-email'),
    onError: (err: { response?: { data?: { error?: string } } }) =>
      toast.error(err.response?.data?.error || 'Erreur lors de la création du compte'),
  })
}

export const useSignOut = () => {
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const navigate = useNavigate()
  return () => {
    clearAuth()
    navigate('/login')
  }
}
