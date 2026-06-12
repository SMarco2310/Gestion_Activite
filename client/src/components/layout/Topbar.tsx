import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { useAuthStore } from '../../store/authStore'
import { useSignOut } from '../../hooks/useAuth'
import { useNotifications, useMarkAllRead, useMarkRead } from '../../hooks/useNotifications'

const ROLE_LABEL: Record<string, string> = {
  chef_departement: 'Chef de département',
  admin: 'Administrateur',
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.round(diff / 60000)
  if (m < 1) return "À l'instant"
  if (m < 60) return `il y a ${m} min`
  const h = Math.round(m / 60)
  if (h < 24) return `il y a ${h} h`
  return `il y a ${Math.round(h / 24)} j`
}

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)

  const { data: notifData } = useNotifications()
  const markAll = useMarkAllRead()
  const markOne = useMarkRead()
  const notifs = notifData?.data ?? []
  const unread = notifData?.unreadCount ?? 0

  const fullName = user?.fullName || 'Utilisateur'
  const role = [ROLE_LABEL[user?.role || ''] || 'Utilisateur', user?.department].filter(Boolean).join(' · ')
  const initials =
    fullName
      .replace(/^(Dr|M\.|Mme|Mlle|Pr)\s+/, '')
      .split(/\s+/)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || 'SY'

  useEffect(() => {
    if (!menuOpen && !notifOpen) return
    const close = () => { setMenuOpen(false); setNotifOpen(false) }
    document.addEventListener('click', close)
    return () => document.removeEventListener('click', close)
  }, [menuOpen, notifOpen])

  return (
    <header className="topbar">
      <div className="institution">
        Ministère de la Santé et de l'Hygiène Publique <span className="rep">— République Togolaise</span>
      </div>
      <div className="topbar-right">
        <div style={{ position: 'relative' }} onClick={(e) => e.stopPropagation()}>
          <button className="iconbtn" title="Notifications" onClick={() => { setNotifOpen((o) => !o); setMenuOpen(false) }}>
            <Icon name="bell" size={18} />
            {unread > 0 && <span className="dot" />}
          </button>
          {notifOpen && (
            <div className="user-menu" style={{ width: 340, right: 0, maxHeight: 420, overflowY: 'auto' }}>
              <div className="between" style={{ padding: '4px 6px 10px' }}>
                <div className="um-name">Notifications{unread > 0 ? ` (${unread})` : ''}</div>
                {unread > 0 && (
                  <button className="link" style={{ fontSize: 12 }} onClick={() => markAll.mutate()}>Tout marquer lu</button>
                )}
              </div>
              <div className="um-divider" />
              {notifs.length === 0 && (
                <div className="muted" style={{ padding: '16px 6px', fontSize: 13 }}>Aucune notification.</div>
              )}
              {notifs.map((n) => (
                <button
                  key={n.id}
                  className="um-item"
                  style={{ alignItems: 'flex-start', gap: 10, opacity: n.isRead ? 0.6 : 1, whiteSpace: 'normal', textAlign: 'left', height: 'auto', padding: '10px 6px' }}
                  onClick={() => {
                    if (!n.isRead) markOne.mutate(n.id)
                    if (n.activityId) { setNotifOpen(false); navigate(`/activities/${n.activityId}`) }
                  }}
                >
                  <span className="um-ico" style={{ marginTop: 1, color: n.type === 'conflit_detecte' ? 'var(--red)' : 'var(--blue-700)' }}>
                    <Icon name={n.type === 'conflit_detecte' ? 'alert' : 'bell'} size={15} />
                  </span>
                  <span className="stack" style={{ gap: 3, minWidth: 0 }}>
                    <span style={{ fontSize: 12.5, fontWeight: n.isRead ? 500 : 700, lineHeight: 1.4 }}>{n.message}</span>
                    <span className="muted" style={{ fontSize: 11 }}>{timeAgo(n.createdAt)}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
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
