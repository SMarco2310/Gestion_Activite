import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { useActivities } from '../../hooks/useActivities'
import { deptMeta, STATUS_LABEL, TYPE_LABEL, fmtRange, STATUS_FILTERS, type ApiActivityStatus } from '../../lib/api'

export default function ActivitiesPage() {
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [status, setStatus] = useState<'Tous' | ApiActivityStatus>('Tous')

  const { data, isLoading } = useActivities(status === 'Tous' ? undefined : { status })
  const activities = data?.data ?? []

  const rows = activities.filter(
    (a) =>
      q.trim() === '' ||
      a.title.toLowerCase().includes(q.toLowerCase()) ||
      (a.referenceNumber || '').toLowerCase().includes(q.toLowerCase()),
  )

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Mes activités</h1>
          <p className="page-desc">Toutes les activités soumises sur la plateforme</p>
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
            <button className={'chip' + (status === 'Tous' ? ' on' : '')} style={{ height: 34, fontSize: 12.5 }} onClick={() => setStatus('Tous')}>
              Tous
            </button>
            {STATUS_FILTERS.map((s) => (
              <button key={s} className={'chip' + (status === s ? ' on' : '')} style={{ height: 34, fontSize: 12.5 }} onClick={() => setStatus(s)}>
                {STATUS_LABEL[s]}
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
            {isLoading && (
              <tr><td colSpan={6} className="muted" style={{ padding: 24, textAlign: 'center' }}>Chargement…</td></tr>
            )}
            {!isLoading && rows.length === 0 && (
              <tr><td colSpan={6} className="muted" style={{ padding: 24, textAlign: 'center' }}>Aucune activité trouvée.</td></tr>
            )}
            {rows.map((a) => {
              const dm = deptMeta(a.department)
              const hasConflict = (a._count?.conflictsAsMain ?? 0) > 0
              return (
                <tr key={a.id} className="clickable" onClick={() => navigate(`/activities/${a.id}`)}>
                  <td>
                    <div className="row" style={{ gap: 9 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: dm.color, flex: 'none' }} />
                      <div>
                        <div className="act-title">{a.title}</div>
                        <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{a.referenceNumber || '—'}</div>
                      </div>
                    </div>
                  </td>
                  <td className="muted">{TYPE_LABEL[a.type]}</td>
                  <td className="muted">{fmtRange(a.startDate, a.endDate)}</td>
                  <td className="muted" style={{ maxWidth: 200 }}>{a.venue}</td>
                  <td>
                    <span className="row" style={{ gap: 8 }}>
                      <span style={{ fontWeight: 700 }}>{a._count?.participants ?? 0}</span>
                      {hasConflict && (
                        <span className="badge red" style={{ fontSize: 10.5 }}>
                          <span className="pip" />
                          {a._count.conflictsAsMain} conflit{a._count.conflictsAsMain > 1 ? 's' : ''}
                        </span>
                      )}
                    </span>
                  </td>
                  <td>
                    <StatusBadge status={STATUS_LABEL[a.status]} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
