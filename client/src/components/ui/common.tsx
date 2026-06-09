import type { ReactNode } from 'react'
import Icon from './Icon'
import { DEPTS, STAFF, STATUS, initials, type PersonRow, type Staff, type StatusKey } from '../../lib/mock'

export function StatusBadge({ status }: { status: StatusKey | string }) {
  const tone = (STATUS as Record<string, string>)[status] || 'slate'
  return (
    <span className={'badge ' + tone}>
      <span className="pip" />
      {status}
    </span>
  )
}

interface PersonProps {
  id?: string
  person?: Staff
  conflict?: boolean
  right?: ReactNode
}

export function Person({ id, person, conflict, right }: PersonProps) {
  const p = person || (id ? STAFF[id] : undefined)
  if (!p) return null
  return (
    <div className={'person' + (conflict ? ' conflict' : '')}>
      <div className="pa">{initials(p.name).toUpperCase()}</div>
      <div className="stack" style={{ flex: 1, minWidth: 0 }}>
        <div className="pn">{p.name}</div>
        <div className="pr">
          {p.role} · {DEPTS[p.dept].short}
        </div>
      </div>
      {right}
    </div>
  )
}

export function DetailPerson({ p, badge }: { p: PersonRow; badge?: boolean }) {
  const ini = (initials(p.name) || 'N').toUpperCase()
  const conflict = p.status === 'Conflit'
  return (
    <div className="between" style={{ padding: '11px 0' }}>
      <div className="person" style={{ alignItems: 'flex-start' }}>
        <div className="pa" style={conflict ? { background: 'var(--red-bg)', color: 'var(--red)' } : undefined}>{ini}</div>
        <div className="stack" style={{ flex: 1, minWidth: 0 }}>
          <div className="pn">{p.name}</div>
          <div className="pr">{p.role}</div>
          {conflict && p.note && (
            <div className="row" style={{ gap: 5, marginTop: 4, color: 'var(--red)', fontSize: 11.5, fontWeight: 600 }}>
              <Icon name="alert" size={12} />
              <span>{p.note}</span>
            </div>
          )}
        </div>
      </div>
      {badge !== false &&
        (p.status === 'Conflit' ? (
          <span className="badge red" style={{ flex: 'none' }}>
            <span className="pip" />
            Conflit
          </span>
        ) : p.status === 'Nouveau' ? (
          <span className="badge blue" style={{ flex: 'none' }}>
            <span className="pip" />
            Nouveau
          </span>
        ) : (
          <span className="badge green" style={{ flex: 'none' }}>
            <span className="pip" />
            Disponible
          </span>
        ))}
    </div>
  )
}
