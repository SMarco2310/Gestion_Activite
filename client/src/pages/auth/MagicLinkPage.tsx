import { useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { AuthShell } from '../../components/auth/AuthShell'
import { useVerifyMagicLink } from '../../hooks/useAuth'

export default function MagicLinkPage() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const verifyMut = useVerifyMagicLink()
  const fired = useRef(false)

  useEffect(() => {
    if (fired.current) return
    fired.current = true
    if (token) verifyMut.mutate(token)
  }, [token, verifyMut])

  return (
    <AuthShell>
      <h1 className="auth-title">Connexion</h1>
      {!token || verifyMut.isError ? (
        <>
          <div className="auth-error">
            <Icon name="alert" size={16} />
            <span>{!token ? 'Lien de connexion manquant.' : 'Lien de connexion invalide ou expiré.'}</span>
          </div>
          <Link className="btn primary" style={{ width: '100%', justifyContent: 'center', height: 42, marginTop: 6 }} to="/login">
            Retour à la connexion
          </Link>
        </>
      ) : (
        <p className="auth-card-sub" style={{ textAlign: 'center' }}>
          <Icon name="mailCheck" size={18} /> Connexion en cours…
        </p>
      )}
    </AuthShell>
  )
}
