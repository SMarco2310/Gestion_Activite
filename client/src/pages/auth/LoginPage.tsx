import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { AuthShell, PwField } from '../../components/auth/AuthShell'
import { useSignIn, useRequestMagicLink } from '../../hooks/useAuth'

export default function LoginPage() {
  const signInMut = useSignIn()
  const magicMut = useRequestMagicLink()
  const [mode, setMode] = useState<'magic' | 'password'>('magic')
  const [email, setEmail] = useState('')
  const [pw, setPw] = useState('')
  const [show, setShow] = useState(false)
  const error = signInMut.isError

  function signIn() {
    if (!email.trim() || !pw) return
    signInMut.mutate({ email: email.trim(), password: pw })
  }
  function sendMagic() {
    if (!email.trim()) return
    magicMut.mutate(email.trim())
  }

  return (
    <AuthShell>
      <h1 className="auth-title">Connexion</h1>
      <p className="auth-card-sub">Accédez à votre espace de gestion des activités</p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Adresse email</label>
        <input
          className={'input' + (error ? ' input-error' : '')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && (mode === 'magic' ? sendMagic() : signIn())}
          placeholder="ex. nom.prenom@sante.gouv.tg"
        />
      </div>

      {mode === 'magic' ? (
        <>
          {magicMut.isSuccess ? (
            <div className="auth-error" style={{ background: 'var(--green-bg)', borderColor: 'var(--green-line)', color: 'var(--green)' }}>
              <Icon name="mailCheck" size={16} />
              <span>Lien envoyé. Consultez votre boîte email pour vous connecter.</span>
            </div>
          ) : (
            <p className="auth-card-sub" style={{ marginTop: -4, marginBottom: 14 }}>
              Recevez un lien de connexion sécurisé par email — sans mot de passe.
            </p>
          )}
          <button
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center', height: 42 }}
            onClick={sendMagic}
            disabled={magicMut.isPending || !email.trim()}
          >
            <Icon name="mail" size={16} /> {magicMut.isPending ? 'Envoi…' : magicMut.isSuccess ? 'Renvoyer le lien' : 'Recevoir un lien de connexion'}
          </button>

          <div className="auth-divider"><span>ou</span></div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', height: 42 }} onClick={() => setMode('password')}>
            <Icon name="lock" size={15} /> Se connecter avec un mot de passe
          </button>
        </>
      ) : (
        <>
          <PwField
            label="Mot de passe"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Votre mot de passe"
            show={show}
            setShow={setShow}
            error={error}
          />

          {error && (
            <div className="auth-error">
              <Icon name="alert" size={16} />
              <span>Identifiants incorrects ou compte verrouillé. Vérifiez vos informations.</span>
            </div>
          )}

          <button
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center', height: 42 }}
            onClick={signIn}
            disabled={signInMut.isPending}
          >
            {signInMut.isPending ? 'Connexion…' : 'Se connecter'}
          </button>

          <div className="auth-divider"><span>ou</span></div>
          <button className="btn" style={{ width: '100%', justifyContent: 'center', height: 42 }} onClick={() => setMode('magic')}>
            <Icon name="mail" size={15} /> Recevoir un lien par email
          </button>
        </>
      )}

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 18 }}>
        Pas encore de compte ?{' '}
        <Link className="auth-link" to="/signup">
          Créer un compte
        </Link>
      </div>
    </AuthShell>
  )
}
