import { useAuthStore } from '../../store/authStore'
import { useNotifications, useMarkAllRead } from '../../hooks/useNotifications'
import { useSignOut } from '../../hooks/useAuth'
import { useState } from 'react'

export default function Topbar() {
  const user = useAuthStore((s) => s.user)
  const signOut = useSignOut()
  const { data } = useNotifications()
  const markAllRead = useMarkAllRead()
  const [showNotifs, setShowNotifs] = useState(false)
  const unread = data?.unreadCount || 0

  const initials = user?.fullName
    .split(' ')
    .slice(-2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || 'U'

  return (
    <header className="h-14 border-b border-gray-200 bg-white px-6 flex items-center justify-between shrink-0">
      <div>
        <span className="font-medium text-sm text-gray-900">Ministère de la Santé et de l'Hygiène Publique</span>
        <span className="text-gray-400 text-sm"> — République Togolaise</span>
      </div>
      <div className="flex items-center gap-4">
        <button
          onClick={() => { setShowNotifs(!showNotifs); if (unread > 0) markAllRead.mutate() }}
          className="relative p-1 text-gray-500 hover:text-gray-700"
        >
          🔔
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full" />
          )}
        </button>
        <div className="flex items-center gap-2">
          <div className="text-right">
            <p className="text-xs font-medium text-gray-900">{user?.fullName}</p>
            <p className="text-[11px] text-gray-400">Chef de département · INH</p>
          </div>
          <button
            onClick={signOut}
            className="w-8 h-8 rounded-full bg-primary-light text-primary text-xs font-medium flex items-center justify-center hover:opacity-80"
            title="Se déconnecter"
          >
            {initials}
          </button>
        </div>
      </div>
    </header>
  )
}
