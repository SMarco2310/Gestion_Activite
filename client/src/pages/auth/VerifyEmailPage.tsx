import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { AuthShell } from '../../components/auth/AuthShell'

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const [activated, setActivated] = useState(false)
  const email = 'sanni.yawa@sante.gouv.tg'

  return (
    <AuthShell>
      {activated ? (
        <>
          <div className="auth-icon green">
            <Icon name="check" size={26} />
          </div>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>
            Compte activé
          </h1>
          <div className="auth-success">
            <Icon name="check" size={16} />
            <span>Votre compte a été activé. Vous pouvez maintenant vous connecter.</span>
          </div>
          <button
            className="btn primary"
            style={{ width: '100%', justifyContent: 'center', height: 42, marginTop: 4 }}
            onClick={() => navigate('/login')}
          >
            Se connecter <Icon name="arrowRight" size={15} />
          </button>
        </>
      ) : (
        <>
          <div className="auth-icon blue">
            <Icon name="mailCheck" size={26} />
          </div>
          <h1 className="auth-title" style={{ textAlign: 'center' }}>
            Vérifiez votre boîte mail
          </h1>
          <p className="auth-card-sub" style={{ textAlign: 'center' }}>
            Un lien de confirmation a été envoyé à :
          </p>

          <div className="auth-email-box">{email}</div>

          <p style={{ fontSize: 13, color: 'var(--ink-2)', lineHeight: 1.55, textAlign: 'center', margin: '0 0 18px' }}>
            Cliquez sur le lien dans l'email pour activer votre compte et accéder à la plateforme. Le lien expire dans 24
            heures.
          </p>

          <div className="auth-checklist">
            {[
              'Vérifiez votre dossier spam ou courrier indésirable',
              "Assurez-vous que l'adresse saisie est correcte",
              'Contactez votre administrateur si le problème persiste',
            ].map((t, i) => (
              <div className="row" key={i} style={{ gap: 9, alignItems: 'flex-start' }}>
                <span style={{ color: 'var(--green)', marginTop: 1, flex: 'none' }}>
                  <Icon name="check" size={15} />
                </span>
                <span style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>{t}</span>
              </div>
            ))}
          </div>

          <button className="btn primary" style={{ width: '100%', justifyContent: 'center', height: 42, marginBottom: 10 }}>
            Renvoyer l'email de confirmation
          </button>
          <button
            className="btn"
            style={{ width: '100%', justifyContent: 'center', height: 42 }}
            onClick={() => navigate('/login')}
          >
            <Icon name="chevronLeft" size={16} /> Retour à la connexion
          </button>

          <div className="auth-demo-hint">
            <span>Démo —</span>
            <a className="auth-link" onClick={() => setActivated(true)}>
              simuler le clic sur le lien de confirmation
            </a>
          </div>
        </>
      )}
    </AuthShell>
  )
}
