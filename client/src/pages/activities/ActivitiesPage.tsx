import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { ACTIVITIES, CONFLICTS, DEPTS, STATUS, type Activity } from '../../lib/mock'

export default function ActivitiesPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState('Tous')
  const conflictStaff = new Set(CONFLICTS.map((c) => c.staff))

  const rows = ACTIVITIES.filter(
    (a) =>
      (status === 'Tous' || a.status === status) &&
      (q.trim() === '' || a.title.toLowerCase().includes(q.toLowerCase()) || a.ref.toLowerCase().includes(q.toLowerCase())),
  )
  const hasConflict = (a: Activity) =>
    a.people.some((p) => conflictStaff.has(p)) && CONFLICTS.some((c) => c.activities.includes(a.id))

  const dateLabel = (a: Activity) =>
    a.startD > 0
      ? `${String(a.startD).padStart(2, '0')}${a.endD !== a.startD ? '–' + String(a.endD).padStart(2, '0') : ''} juin 2026`
      : '26–27 mai 2026'

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes activités</h1>
          <p className="page-desc">Toutes les activités soumises par l'Institut National d'Hygiène</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/activities/new')}>
          <Icon name="plus" size={17} /> Nouvelle activité
        </button>
      </div>

      <div className="card">
        <div className="between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)', gap: 14 }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 360 }}>
            <span style={{ position: 'absolute', left: 12, top: 10, color: 'var(--muted)' }}>
              <Icon name="search" size={16} />
            </span>
            <input
              className="input"
              style={{ height: 36, paddingLeft: 36 }}
              placeholder="Rechercher une activité…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div className="row" style={{ gap: 8 }}>
            {['Tous', ...Object.keys(STATUS)].map((s) => (
              <button key={s} className={'chip' + (status === s ? ' on' : '')} style={{ height: 34, fontSize: 12.5 }} onClick={() => setStatus(s)}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <table className="tbl">
          <thead>
            <tr>
              <th>Activité</th>
              <th>Type</th>
              <th>Dates</th>
              <th>Lieu</th>
              <th>Participants</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.id} className="clickable" onClick={() => navigate(`/activities/${a.id}`)}>
                <td>
                  <div className="row" style={{ gap: 9 }}>
                    <span style={{ width: 9, height: 9, borderRadius: 2, background: DEPTS[a.dept].color, flex: 'none' }} />
                    <div>
                      <div className="act-title">{a.title}</div>
                      <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{a.ref}</div>
                    </div>
                  </div>
                </td>
                <td className="muted">{a.type}</td>
                <td className="muted">{dateLabel(a)}</td>
                <td className="muted" style={{ maxWidth: 200 }}>{a.venue}</td>
                <td>
                  <span className="row" style={{ gap: 8 }}>
                    <span style={{ fontWeight: 700 }}>{a.people.length}</span>
                    {hasConflict(a) && (
                      <span className="badge red" style={{ fontSize: 10.5 }}>
                        <span className="pip" />
                        Conflit
                      </span>
                    )}
                  </span>
                </td>
                <td>
                  <StatusBadge status={a.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
