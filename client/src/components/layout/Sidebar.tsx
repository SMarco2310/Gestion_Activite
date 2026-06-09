import { NavLink } from 'react-router-dom'
import Icon, { type IconName } from '../ui/Icon'
import { CONFLICTS } from '../../lib/mock'

interface NavEntry {
  to: string
  label: string
  ico: IconName
  end?: boolean
  showCount?: boolean
}

const NAV: NavEntry[] = [
  { to: '/dashboard', label: 'Tableau de bord', ico: 'dashboard' },
  { to: '/activities/new', label: 'Nouvelle activité', ico: 'plus' },
  { to: '/calendar', label: 'Calendrier', ico: 'calendar' },
  { to: '/activities', label: 'Mes activités', ico: 'list', end: true },
  { to: '/conflicts', label: 'Conflits', ico: 'alert', showCount: true },
  { to: '/exports', label: 'Exports', ico: 'download' },
]

export default function Sidebar() {
  const conflictCount = CONFLICTS.length

  return (
    <nav className="sidebar">
      <div className="nav-section">Navigation</div>
      {NAV.map((n) => (
        <NavLink
          key={n.to}
          to={n.to}
          end={n.end}
          className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
        >
          <span className="ico">
            <Icon name={n.ico} size={18} />
          </span>
          <span className="label">{n.label}</span>
          {n.showCount && conflictCount > 0 ? <span className="count">{conflictCount}</span> : null}
        </NavLink>
      ))}
      <div className="spacer" />
      <div className="sidebar-foot">
        Institut National d'Hygiène
        <br />
        <span style={{ color: 'var(--muted)' }}>Cycle de planification · juin 2026</span>
      </div>
    </nav>
  )
}
