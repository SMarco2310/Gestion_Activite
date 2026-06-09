import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { useAuthStore } from '../../store/authStore'
import { useSignOut } from '../../hooks/useAuth'

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const fullName = user?.fullName || 'Dr SANNI Yawa Justine'
  const role = 'Chef de département · INH'
  const initials =
    fullName
      .replace(/^(Dr|M\.|Mme|Mlle|Pr)\s+/, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'SY'

  useEffect(() => {
    if (!menuOpen) return
    const close = () => setMenuOpen(false)
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen])

  return (
    <header className="topbar">
      <div className="institution">
        Ministère de la Santé et de l'Hygiène Publique <span className="rep">— République Togolaise</span>
      </div>
      <div className="topbar-right">
        <button className="iconbtn" title="Notifications">
          <Icon name="bell" size={18} />
          <span className="dot" />
        </button>
        <div
          className="user user-trigger"
          onClick={(e) => {
            e.stopPropagation()
            setMenuOpen((o) => !o)
          }}
          style={{ position: 'relative' }}
        >
          <div className="meta" style={{ textAlign: 'right' }}>
            <div className="name">{fullName}</div>
            <div className="role">{role}</div>
          </div>
          <div className="avatar">{initials}</div>

          {menuOpen && (
            <div className="user-menu" onClick={(e) => e.stopPropagation()}>
              <div className="um-identity">
                <div className="avatar">{initials}</div>
                <div className="stack" style={{ minWidth: 0 }}>
                  <div className="um-name">{fullName}</div>
                  <div className="um-role">{role}</div>
                </div>
              </div>
              <div className="um-divider" />
              <button
                className="um-item"
                onClick={() => {
                  setMenuOpen(false)
                  navigate('/profile')
                }}
              >
                <span className="um-ico">
                  <Icon name="user" size={16} />
                </span>{' '}
                Mon profil
              </button>
              <div className="um-divider" />
              <button
                className="um-item danger"
                onClick={() => {
                  setMenuOpen(false)
                  signOut()
                }}
              >
                <span className="um-ico">
                  <Icon name="logout" size={16} />
                </span>{' '}
                Se déconnecter
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
