import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { AuthShell } from '../../components/auth/AuthShell'
import { DEPTS } from '../../lib/mock'
import { useSignUp } from '../../hooks/useAuth'

const GOV_DOMAINS = ['sante.gouv.tg', 'inh.tg', 'mshpcsua.tg']
function isGovEmail(email: string) {
  const at = email.split('@')[1]
  return !!at && GOV_DOMAINS.some((d) => at.toLowerCase() === d)
}

export default function SignUpPage() {
  const signUpMut = useSignUp()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [dept, setDept] = useState('INH')
  const [deptOther, setDeptOther] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [show1, setShow1] = useState(false)
  const [show2, setShow2] = useState(false)

  const emailValid = isGovEmail(email)
  const emailTouched = email.length > 0
  const strength = (() => {
    let s = 0
    if (pw.length >= 8) s++
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++
    if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) s++
    return s
  })()
  const strengthMeta = [
    { label: '—', color: 'var(--line-strong)' },
    { label: 'faible', color: 'var(--red)' },
    { label: 'moyen', color: 'var(--amber)' },
    { label: 'fort', color: 'var(--green)' },
  ][strength]
  const match = pw.length > 0 && pw === pw2
  const pwValid = pw.length >= 8 && /[A-Z]/.test(pw) && /[0-9]/.test(pw)
  const canSubmit = name.trim().length >= 3 && emailValid && match && pwValid

  function submit() {
    if (!canSubmit) return
    signUpMut.mutate({ fullName: name.trim(), email: email.trim(), password: pw, confirmPassword: pw2 })
  }

  return (
    <AuthShell>
      <h1 className="auth-title">Créer un compte</h1>
      <p className="auth-card-sub">
        Seuls les emails gouvernementaux sont acceptés (@sante.gouv.tg, @inh.tg, @mshpcsua.tg)
      </p>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Nom complet</label>
        <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. Dr SANNI Yawa Justine" />
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Adresse email professionnelle</label>
        <input
          className={'input' + (emailTouched && !emailValid ? ' input-error' : '')}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="ex. nom.prenom@sante.gouv.tg"
        />
        {emailTouched &&
          (emailValid ? (
            <span className="val-ok">
              <Icon name="check" size={13} /> Email gouvernemental reconnu
            </span>
          ) : (
            <span className="val-err">
              <Icon name="alert" size={13} /> Seuls les emails gouvernementaux sont acceptés (ex. @sante.gouv.tg)
            </span>
          ))}
      </div>

      <div className="field" style={{ marginBottom: 16 }}>
        <label>Département / Structure de rattachement</label>
        <select className="select" value={dept} onChange={(e) => setDept(e.target.value)}>
          {Object.values(DEPTS).map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
          <option value="__other">Autre — saisir manuellement…</option>
        </select>
        {dept === '__other' && (
          <input
            className="input"
            style={{ marginTop: 10 }}
            value={deptOther}
            onChange={(e) => setDeptOther(e.target.value)}
            placeholder="ex. Direction des Pharmacies et Laboratoires"
            autoFocus
          />
        )}
      </div>

      <div className="field" style={{ marginBottom: 10 }}>
        <label>Mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            style={{ paddingRight: 42 }}
            type={show1 ? 'text' : 'password'}
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Votre mot de passe"
          />
          <button type="button" className="pw-toggle" onClick={() => setShow1((s) => !s)}>
            <Icon name={show1 ? 'eyeOff' : 'eye'} size={17} />
          </button>
        </div>
        <div className="pw-strength">
          {[1, 2, 3].map((seg) => (
            <span key={seg} className="pw-seg" style={{ background: strength >= seg ? strengthMeta.color : 'var(--line)' }} />
          ))}
          <span className="pw-strength-label" style={{ color: strengthMeta.color }}>
            {strengthMeta.label}
          </span>
        </div>
      </div>

      <div className="field" style={{ marginBottom: 18 }}>
        <label>Confirmer le mot de passe</label>
        <div style={{ position: 'relative' }}>
          <input
            className="input"
            style={{ paddingRight: 42 }}
            type={show2 ? 'text' : 'password'}
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            placeholder="Confirmez votre mot de passe"
          />
          <button type="button" className="pw-toggle" onClick={() => setShow2((s) => !s)}>
            <Icon name={show2 ? 'eyeOff' : 'eye'} size={17} />
          </button>
        </div>
        {pw2.length > 0 &&
          (match ? (
            <span className="val-ok">
              <Icon name="check" size={13} /> Les mots de passe correspondent
            </span>
          ) : (
            <span className="val-err">
              <Icon name="alert" size={13} /> Les mots de passe ne correspondent pas
            </span>
          ))}
      </div>

      <button
        className="btn primary"
        style={{ width: '100%', justifyContent: 'center', height: 42 }}
        onClick={submit}
        disabled={!canSubmit || signUpMut.isPending}
      >
        {signUpMut.isPending ? 'Création…' : 'Créer mon compte'}
      </button>
      <p className="auth-fine">En créant un compte, vous acceptez les conditions d'utilisation de la plateforme.</p>

      <div style={{ textAlign: 'center', fontSize: 13, color: 'var(--muted)', marginTop: 14 }}>
        Déjà inscrit ?{' '}
        <Link className="auth-link" to="/login">
          Se connecter
        </Link>
      </div>
    </AuthShell>
  )
}
