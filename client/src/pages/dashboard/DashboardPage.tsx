import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { useActivities } from '../../hooks/useActivities'
import { useConflicts } from '../../hooks/useConflicts'
import { deptMeta, STATUS_LABEL, fmtRange } from '../../lib/api'

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const DOW = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

function mondayOf(d: Date) {
  const x = new Date(d)
  const day = (x.getDay() + 6) % 7 // 0 = Monday
  x.setDate(x.getDate() - day)
  x.setHours(0, 0, 0, 0)
  return x
}
const iso = (d: Date) => d.toISOString().slice(0, 10)

export default function DashboardPage() {
  const navigate = useNavigate()
  const [weekOffset, setWeekOffset] = useState(0)
  const { data: actData, isLoading } = useActivities()
  const { data: conflictData } = useConflicts()

  const activities = actData?.data ?? []
  const conflicts = conflictData?.data ?? []
  const recent = activities.slice(0, 6)

  const now = new Date()
  const monthLabel = `${MONTHS_FR[now.getMonth()]} ${now.getFullYear()}`
  const thisMonth = activities.filter((a) => {
    const s = new Date(a.startDate)
    return s.getMonth() === now.getMonth() && s.getFullYear() === now.getFullYear()
  })
  const enCours = thisMonth.filter((a) => a.status === 'actif').length
  const aVenir = thisMonth.filter((a) => a.status === 'soumis' || a.status === 'brouillon').length
  const conflictParticipants = new Set(conflicts.map((c) => c.participantName)).size
  const activeDepts = new Set(activities.filter((a) => a.status !== 'archive').map((a) => a.department)).size

  const kpis: { label: string; val: string; ico: IconName; tone: 'blue' | 'red' | 'amber' | 'slate'; foot: ReactNode }[] = [
    { label: 'Activités ce mois-ci', val: String(thisMonth.length), ico: 'calendar', tone: 'blue', foot: (<span><strong>{enCours}</strong> en cours · <strong>{aVenir}</strong> à venir</span>) },
    { label: 'Conflits actifs', val: String(conflicts.length), ico: 'alert', tone: 'red', foot: (<span><strong>{conflictParticipants}</strong> participant(s) concerné(s)</span>) },
    { label: 'Activités totales', val: String(actData?.total ?? activities.length), ico: 'list', tone: 'amber', foot: <span>toutes périodes confondues</span> },
    { label: 'Départements actifs', val: String(activeDepts), ico: 'building', tone: 'slate', foot: <span>institutions impliquées</span> },
  ]
  const toneStyle = {
    blue: { c: 'var(--blue)', b: 'var(--blue-50)' },
    red: { c: 'var(--red)', b: 'var(--red-bg)' },
    amber: { c: 'var(--amber)', b: 'var(--amber-bg)' },
    slate: { c: 'var(--slate)', b: 'var(--slate-bg)' },
  }

  const weekStart = mondayOf(now)
  weekStart.setDate(weekStart.getDate() + weekOffset * 7)
  const week = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart)
    d.setDate(d.getDate() + i)
    return d
  })
  const dayActs = (d: Date) => {
    const day = iso(d)
    return activities.filter((a) => a.startDate <= day && a.endDate >= day && a.status !== 'archive')
  }
  const todayIso = iso(now)

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-desc">Vue d'ensemble des activités institutionnelles · {monthLabel}</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/activities/new')}>
          <Icon name="plus" size={17} /> Nouvelle activité
        </button>
      </div>

      {/* KPIs */}
      <div className="kpi-row">
        {kpis.map((k, i) => (
          <div className="kpi" key={i}>
            <div className="k-top">
              <span className="k-label">{k.label}</span>
              <span className="k-ico" style={{ background: toneStyle[k.tone].b, color: toneStyle[k.tone].c }}>
                <Icon name={k.ico} size={17} />
              </span>
            </div>
            <div className="k-val" style={{ color: k.tone === 'red' ? 'var(--red)' : 'var(--ink)' }}>{k.val}</div>
            <div className="k-foot">{k.foot}</div>
          </div>
        ))}
      </div>

      {/* Week strip */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head">
          <h2 className="card-title">Semaine en cours</h2>
          <div className="row" style={{ gap: 10 }}>
            <button className="iconbtn" style={{ width: 30, height: 30 }} title="Semaine précédente" onClick={() => setWeekOffset((o) => o - 1)}><Icon name="chevronLeft" size={15} /></button>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 600, minWidth: 150, textAlign: 'center' }}>
              {String(week[0].getDate()).padStart(2, '0')} – {String(week[6].getDate()).padStart(2, '0')} {MONTHS_FR[week[6].getMonth()]} {week[6].getFullYear()}
            </span>
            <button className="iconbtn" style={{ width: 30, height: 30 }} title="Semaine suivante" onClick={() => setWeekOffset((o) => o + 1)}><Icon name="chevronRight" size={15} /></button>
            {weekOffset !== 0 && <button className="btn ghost sm" onClick={() => setWeekOffset(0)}>Aujourd'hui</button>}
            <button className="btn ghost sm" onClick={() => navigate('/calendar')}>
              Calendrier <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
          {week.map((d, idx) => {
            const acts = dayActs(d)
            const isToday = iso(d) === todayIso
            return (
              <div
                key={idx}
                style={{
                  border: isToday ? '1px solid var(--blue)' : '1px solid var(--line)',
                  background: isToday ? 'var(--blue-50)' : 'var(--card)',
                  borderRadius: 6,
                  padding: '10px 10px 12px',
                  minHeight: 104,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>{DOW[idx]}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? 'var(--blue-700)' : 'var(--ink)', marginTop: 2 }}>{String(d.getDate()).padStart(2, '0')}</div>
                <div className="stack" style={{ gap: 4, marginTop: 8 }}>
                  {acts.slice(0, 3).map((a) => {
                    const dm = deptMeta(a.department)
                    return (
                      <div
                        key={a.id}
                        title={a.title}
                        style={{ fontSize: 11, fontWeight: 600, color: dm.color, background: dm.bg, border: '1px solid ' + dm.line, borderRadius: 4, padding: '2px 6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                      >
                        {dm.short}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid-main" style={{ marginTop: 20 }}>
        {/* Recent activities table */}
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Activités récentes</h2>
            <button className="btn ghost sm" onClick={() => navigate('/activities')}>Tout afficher</button>
          </div>
          <table className="tbl">
            <thead>
              <tr>
                <th>Activité</th>
                <th>Département</th>
                <th>Dates</th>
                <th>Statut</th>
                <th style={{ textAlign: 'right' }}>Part.</th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={5} className="muted" style={{ padding: 20, textAlign: 'center' }}>Chargement…</td></tr>
              )}
              {!isLoading && recent.length === 0 && (
                <tr><td colSpan={5} className="muted" style={{ padding: 20, textAlign: 'center' }}>Aucune activité pour le moment.</td></tr>
              )}
              {recent.map((a) => {
                const dm = deptMeta(a.department)
                return (
                  <tr key={a.id} className="clickable" onClick={() => navigate(`/activities/${a.id}`)}>
                    <td>
                      <div className="act-title">{a.title}</div>
                      <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{a.referenceNumber || '—'}</div>
                    </td>
                    <td>
                      <span className="row" style={{ gap: 7 }}>
                        <span style={{ width: 9, height: 9, borderRadius: 2, background: dm.color, flex: 'none' }} />
                        {dm.short}
                      </span>
                    </td>
                    <td className="muted">{fmtRange(a.startDate, a.endDate)}</td>
                    <td><StatusBadge status={STATUS_LABEL[a.status]} /></td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{a._count?.participants ?? 0}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Conflict feed */}
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Conflits signalés</h2>
            <span className="badge red"><span className="pip" />{conflicts.length} actif{conflicts.length > 1 ? 's' : ''}</span>
          </div>
          <div>
            {conflicts.length === 0 && (
              <div className="muted" style={{ padding: 20, fontSize: 13 }}>Aucun conflit détecté.</div>
            )}
            {conflicts.map((c) => {
              const dmA = deptMeta(c.activity.department)
              const dmB = deptMeta(c.conflictingActivity.department)
              return (
                <div className="feed-item" key={c.id}>
                  <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--red)', marginTop: 1, flex: 'none' }}><Icon name="alert" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{c.participantName}</div>
                      <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.5 }}>
                        Programmé sur <strong>2</strong> activités qui se chevauchent :
                        <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                          <li style={{ marginBottom: 2 }}>{c.activity.title} <span className="muted">({dmA.short})</span></li>
                          <li style={{ marginBottom: 2 }}>{c.conflictingActivity.title} <span className="muted">({dmB.short})</span></li>
                        </ul>
                      </div>
                      <div className="row" style={{ marginTop: 10, gap: 8 }}>
                        <span className="badge amber" style={{ fontSize: 11 }}>Chevauchement {fmtRange(c.conflictingActivity.startDate, c.conflictingActivity.endDate)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div style={{ padding: '14px 18px' }}>
              <button className="btn primary sm" style={{ width: '100%', justifyContent: 'center' }} onClick={() => navigate('/conflicts')}>
                Résoudre les conflits
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
