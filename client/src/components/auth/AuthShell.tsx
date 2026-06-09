import type { ReactNode } from 'react'
import Icon from '../ui/Icon'

export function AuthShell({ children, footer }: { children: ReactNode; footer?: ReactNode }) {
  return (
    <div className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <img className="auth-emblem" src="/Armoiries_du_Togo.svg.png" alt="Armoiries de la République Togolaise" />
          <div className="stack" style={{ alignItems: 'center', gap: 2 }}>
            <div className="auth-name">GestiActivités</div>
            <div className="auth-sub">
              Ministère de la Santé et de l'Hygiène Publique — République Togolaise
            </div>
          </div>
        </div>
        <div className="auth-card">{children}</div>
        {footer}
        <div className="auth-copy">© 2026 Ministère de la Santé et de l'Hygiène Publique du Togo</div>
      </div>
    </div>
  )
}

interface PwFieldProps {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  show: boolean
  setShow: (fn: (s: boolean) => boolean) => void
  error?: boolean
}

export function PwField({ label, value, onChange, placeholder, show, setShow, error }: PwFieldProps) {
  return (
    <div className="field" style={{ marginBottom: 16 }}>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input
          className={'input' + (error ? ' input-error' : '')}
          style={{ paddingRight: 42 }}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />
        <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)} title={show ? 'Masquer' : 'Afficher'}>
          <Icon name={show ? 'eyeOff' : 'eye'} size={17} />
        </button>
      </div>
    </div>
  )
}
