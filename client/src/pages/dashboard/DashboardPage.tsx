import type { ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { ACTIVITIES, CONFLICTS, DEPTS, STAFF } from '../../lib/mock'

export default function DashboardPage() {
  const navigate = useNavigate()
  const recent = ACTIVITIES.filter((a) => a.id !== 'A8').slice(0, 6)

  const kpis: { label: string; val: string; ico: IconName; tone: 'blue' | 'red' | 'amber' | 'slate'; foot: ReactNode }[] = [
    { label: 'Activités ce mois-ci', val: '8', ico: 'calendar', tone: 'blue', foot: (<span><strong>5</strong> en cours · <strong>3</strong> à venir</span>) },
    { label: 'Conflits actifs', val: '2', ico: 'alert', tone: 'red', foot: (<span><strong>2</strong> participants concernés</span>) },
    { label: 'Échéances proches', val: '3', ico: 'clock', tone: 'amber', foot: (<span>Soumission sous <strong>7 jours</strong></span>) },
    { label: 'Départements actifs', val: '4', ico: 'building', tone: 'slate', foot: <span>sur 4 institutions</span> },
  ]
  const toneStyle = {
    blue: { c: 'var(--blue)', b: 'var(--blue-50)' },
    red: { c: 'var(--red)', b: 'var(--red-bg)' },
    amber: { c: 'var(--amber)', b: 'var(--amber-bg)' },
    slate: { c: 'var(--slate)', b: 'var(--slate-bg)' },
  }

  const week = [
    { dow: 'lun', d: 1 }, { dow: 'mar', d: 2 }, { dow: 'mer', d: 3 }, { dow: 'jeu', d: 4 },
    { dow: 'ven', d: 5 }, { dow: 'sam', d: 6 }, { dow: 'dim', d: 7 },
  ]
  const dayActs = (d: number) => ACTIVITIES.filter((a) => a.startD <= d && a.endD >= d && a.startD > 0)
  const today = 4

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-desc">Vue d'ensemble des activités institutionnelles · juin 2026</p>
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
          <div className="row" style={{ gap: 14 }}>
            <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>1 – 7 juin 2026</span>
            <button className="btn ghost sm" onClick={() => navigate('/calendar')}>
              Voir le calendrier <Icon name="arrowRight" size={15} />
            </button>
          </div>
        </div>
        <div className="card-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', gap: 10 }}>
          {week.map((w) => {
            const acts = dayActs(w.d)
            const isToday = w.d === today
            return (
              <div
                key={w.d}
                style={{
                  border: isToday ? '1px solid var(--blue)' : '1px solid var(--line)',
                  background: isToday ? 'var(--blue-50)' : 'var(--card)',
                  borderRadius: 6,
                  padding: '10px 10px 12px',
                  minHeight: 104,
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)' }}>{w.dow}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: isToday ? 'var(--blue-700)' : 'var(--ink)', marginTop: 2 }}>{String(w.d).padStart(2, '0')}</div>
                <div className="stack" style={{ gap: 4, marginTop: 8 }}>
                  {acts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      title={a.title}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: DEPTS[a.dept].color,
                        background: DEPTS[a.dept].bg,
                        border: '1px solid ' + DEPTS[a.dept].line,
                        borderRadius: 4,
                        padding: '2px 6px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {DEPTS[a.dept].short}
                    </div>
                  ))}
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
              {recent.map((a) => (
                <tr key={a.id} className="clickable" onClick={() => navigate(`/activities/${a.id}`)}>
                  <td>
                    <div className="act-title">{a.title}</div>
                    <div className="muted mono" style={{ fontSize: 11.5, marginTop: 2 }}>{a.ref}</div>
                  </td>
                  <td>
                    <span className="row" style={{ gap: 7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: 2, background: DEPTS[a.dept].color, flex: 'none' }} />
                      {DEPTS[a.dept].short}
                    </span>
                  </td>
                  <td className="muted">{a.startD > 0 ? `${String(a.startD).padStart(2, '0')}${a.endD !== a.startD ? '–' + String(a.endD).padStart(2, '0') : ''} juin` : '26–27 mai'}</td>
                  <td><StatusBadge status={a.status} /></td>
                  <td style={{ textAlign: 'right', fontWeight: 700 }}>{a.people.length}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Conflict feed */}
        <div className="card">
          <div className="card-head">
            <h2 className="card-title">Conflits signalés</h2>
            <span className="badge red"><span className="pip" />2 actifs</span>
          </div>
          <div>
            {CONFLICTS.map((c) => {
              const p = STAFF[c.staff]
              const acts = c.activities.map((id) => ACTIVITIES.find((a) => a.id === id)!)
              return (
                <div className="feed-item" key={c.id}>
                  <div className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
                    <span style={{ color: 'var(--red)', marginTop: 1, flex: 'none' }}><Icon name="alert" size={16} /></span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                      <div className="muted" style={{ fontSize: 12, marginTop: 1 }}>{p.role} · {DEPTS[p.dept].short}</div>
                      <div style={{ marginTop: 9, fontSize: 12.5, lineHeight: 1.5 }}>
                        Programmé sur <strong>{acts.length}</strong> activités qui se chevauchent :
                        <ul style={{ margin: '6px 0 0', paddingLeft: 16 }}>
                          {acts.map((a) => (
                            <li key={a.id} style={{ marginBottom: 2 }}>
                              {a.title} <span className="muted">({DEPTS[a.dept].short})</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="row" style={{ marginTop: 10, gap: 8 }}>
                        <span className="badge amber" style={{ fontSize: 11 }}>Chevauchement {c.overlap}</span>
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
