import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { AuthShell, PwField } from '../../components/auth/AuthShell'
import { useAuthStore } from '../../store/authStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [email, setEmail] = useState('dr.kpodar@sante.gouv.tg')
  const [pw, setPw] = useState('••••••••')
  const [show, setShow] = useState(false)
  const [error, setError] = useState(true) // error state shown for demo parity with mockup

  // Demo session so all pages are viewable while the DB is unseeded.
  // Replace with useSignIn() once real users exist.
  function signIn() {
    setAuth('demo-token', {
      id: 'demo',
      fullName: 'Dr SANNI Yawa Justine',
      email: 'sanni.yawa@sante.gouv.tg',
      department: "Institut National d'Hygiène",
      role: 'chef_departement',
      emailVerified: true,
      createdAt: new Date().toISOString(),
    })
    navigate('/dashboard')
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
          onChange={(e) => {
            setEmail(e.target.value)
            setError(false)
          }}
          placeholder="ex. nom.prenom@sante.gouv.tg"
        />
      </div>

      <PwField
        label="Mot de passe"
        value={pw}
        onChange={(e) => {
          setPw(e.target.value)
          setError(false)
        }}
        placeholder="Votre mot de passe"
        show={show}
        setShow={setShow}
        error={error}
      />

      <div style={{ textAlign: 'right', marginTop: -6, marginBottom: 14 }}>
        <a className="auth-link" style={{ fontSize: 12.5 }}>
          Mot de passe oublié ?
        </a>
      </div>

      {error && (
        <div className="auth-error">
          <Icon name="alert" size={16} />
          <span>Identifiants incorrects. Vérifiez votre email et mot de passe.</span>
        </div>
      )}

      <button className="btn primary" style={{ width: '100%', justifyContent: 'center', height: 42 }} onClick={signIn}>
        Se connecter
      </button>

      <div className="auth-divider">
        <span>ou</span>
      </div>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)' }}>
        Pas encore de compte ?{' '}
        <Link className="auth-link" to="/signup">
          Créer un compte
        </Link>
      </div>
    </AuthShell>
  )
}
