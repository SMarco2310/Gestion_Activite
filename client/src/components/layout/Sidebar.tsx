import { NavLink } from 'react-router-dom'
import { useConflicts } from '../../hooks/useConflicts'

const navItems = [
  { to: '/dashboard', label: 'Tableau de bord', icon: '⊞' },
  { to: '/activities/new', label: 'Nouvelle activité', icon: '+' },
  { to: '/calendar', label: 'Calendrier', icon: '⊟' },
  { to: '/activities', label: 'Mes activités', icon: '≡' },
  { to: '/conflicts', label: 'Conflits', icon: '⚠', showBadge: true },
  { to: '/exports', label: 'Exports', icon: '↓' },
]

export default function Sidebar() {
  const { data: conflictData } = useConflicts()
  const conflictCount = conflictData?.total || 0

  return (
    <aside className="w-52 shrink-0 bg-white border-r border-gray-200 flex flex-col py-4">
      <div className="px-3 mb-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400 px-2 mb-2">Navigation</p>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2 px-3 py-2 rounded-md text-sm mb-0.5 transition-colors ${
                isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'text-gray-500 hover:bg-gray-50'
              }`
            }
          >
            <span className="w-4 text-center">{item.icon}</span>
            <span className="flex-1">{item.label}</span>
            {item.showBadge && conflictCount > 0 && (
              <span className="w-2 h-2 rounded-full bg-red-500" />
            )}
          </NavLink>
        ))}
      </div>
      <div className="mt-auto border-t border-gray-100 px-3 pt-4">
        <NavLink
          to="/settings"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 hover:bg-gray-50"
        >
          <span>⚙</span> Paramètres
        </NavLink>
      </div>
    </aside>
  )
}
