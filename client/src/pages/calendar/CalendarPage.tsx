import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { ACTIVITIES, DEPTS, STATUS, type Activity } from '../../lib/mock'

interface Popover {
  act: Activity
  x: number
  y: number
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [deptFilter, setDeptFilter] = useState<string[]>(Object.keys(DEPTS))
  const [statusFilter, setStatusFilter] = useState('Tous')
  const [range, setRange] = useState('mois')
  const [popover, setPopover] = useState<Popover | null>(null)

  const toggleDept = (id: string) =>
    setDeptFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const daysInMonth = 30
  const firstDow = 0
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const conflictDays = new Set([2, 3, 4, 5])
  const rangeWindow = ({ mois: [1, 30], s1: [1, 7], s2: [8, 14], s3: [15, 21], s4: [22, 30] } as Record<string, number[]>)[range]

  const matches = (a: Activity) =>
    deptFilter.includes(a.dept) && (statusFilter === 'Tous' || a.status === statusFilter) && a.startD > 0

  const actsOnDay = (d: number) =>
    ACTIVITIES.filter((a) => matches(a) && a.startD <= d && a.endD >= d && d >= rangeWindow[0] && d <= rangeWindow[1])

  const dows = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

  return (
    <div className="content" onClick={() => setPopover(null)}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Calendrier général</h1>
          <p className="page-desc">Toutes les activités institutionnelles · juin 2026</p>
        </div>
        <button className="btn primary" onClick={() => navigate('/activities/new')}>
          <Icon name="plus" size={17} /> Nouvelle activité
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 18 }}>
        <div className="between" style={{ flexWrap: 'wrap', gap: 14 }}>
          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <span className="row" style={{ gap: 7, color: 'var(--muted)', fontSize: 12.5, fontWeight: 700 }}>
              <Icon name="filter" size={15} /> Départements
            </span>
            {Object.values(DEPTS).map((d) => {
              const on = deptFilter.includes(d.id)
              return (
                <button
                  key={d.id}
                  className="chip"
                  onClick={() => toggleDept(d.id)}
                  style={{
                    height: 32,
                    fontSize: 12.5,
                    borderColor: on ? d.color : 'var(--line-strong)',
                    background: on ? d.bg : 'var(--card)',
                    color: on ? d.color : 'var(--muted)',
                  }}
                >
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: on ? d.color : 'var(--muted-2)' }} />
                  {d.short}
                </button>
              )
            })}
          </div>
          <div className="row" style={{ gap: 10 }}>
            <select className="select" style={{ height: 34, width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="Tous">Tous les statuts</option>
              {Object.keys(STATUS).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            <select className="select" style={{ height: 34, width: 150 }} value={range} onChange={(e) => setRange(e.target.value)}>
              <option value="mois">Tout le mois</option>
              <option value="s1">1 – 7 juin</option>
              <option value="s2">8 – 14 juin</option>
              <option value="s3">15 – 21 juin</option>
              <option value="s4">22 – 30 juin</option>
            </select>
          </div>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
          <h2 className="card-title" style={{ fontSize: 16 }}>Juin 2026</h2>
          <div className="row" style={{ gap: 8 }}>
            <button className="iconbtn" style={{ width: 32, height: 32 }}><Icon name="chevronLeft" size={16} /></button>
            <button className="iconbtn" style={{ width: 32, height: 32 }}><Icon name="chevronRight" size={16} /></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {dows.map((d) => (
            <div key={d} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const acts = d ? actsOnDay(d) : []
            const hasConflict = d && conflictDays.has(d) && deptFilter.length > 0
            const dim = d && (d < rangeWindow[0] || d > rangeWindow[1])
            return (
              <div
                key={i}
                style={{
                  minHeight: 116,
                  borderBottom: '1px solid var(--line)',
                  borderRight: '1px solid var(--line)',
                  padding: '7px 7px 8px',
                  background: d ? (dim ? 'var(--bg)' : 'var(--card)') : '#FBFCFD',
                  opacity: dim ? 0.5 : 1,
                }}
              >
                {d && (
                  <div className="between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: d === 4 ? 'var(--blue-700)' : 'var(--ink-2)', background: d === 4 ? 'var(--blue-50)' : 'transparent', borderRadius: 4, padding: '1px 6px' }}>{String(d).padStart(2, '0')}</span>
                    {hasConflict && <span title="Conflit ce jour" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
                  </div>
                )}
                <div className="stack" style={{ gap: 3 }}>
                  {acts.slice(0, 3).map((a) => (
                    <div
                      key={a.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setPopover({ act: a, x: e.clientX, y: e.clientY })
                      }}
                      title={a.title}
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: DEPTS[a.dept].color,
                        background: DEPTS[a.dept].bg,
                        borderLeft: '3px solid ' + DEPTS[a.dept].color,
                        borderRadius: 3,
                        padding: '3px 6px',
                        cursor: 'pointer',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {a.title}
                    </div>
                  ))}
                  {acts.length > 3 && <div className="muted" style={{ fontSize: 11, fontWeight: 600, paddingLeft: 4 }}>+{acts.length - 3} autre(s)</div>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="between" style={{ marginTop: 14, flexWrap: 'wrap', gap: 12 }}>
        <div className="row" style={{ gap: 18, flexWrap: 'wrap' }}>
          {Object.values(DEPTS).map((d) => (
            <span key={d.id} className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
              <span style={{ width: 11, height: 11, borderRadius: 3, background: d.color }} />
              {d.name}
            </span>
          ))}
        </div>
        <span className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />
          Jour avec conflit de planification
        </span>
      </div>

      {/* Popover */}
      {popover && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed',
            zIndex: 50,
            left: Math.min(popover.x, window.innerWidth - 320),
            top: Math.min(popover.y + 10, window.innerHeight - 260),
            width: 300,
            background: 'var(--card)',
            border: '1px solid var(--line-strong)',
            borderRadius: 8,
            boxShadow: '0 8px 28px rgba(20,40,70,.16)',
          }}
        >
          <div style={{ height: 4, background: DEPTS[popover.act.dept].color, borderRadius: '8px 8px 0 0' }} />
          <div style={{ padding: '14px 16px' }}>
            <div className="between" style={{ marginBottom: 8 }}>
              <span className="badge" style={{ color: DEPTS[popover.act.dept].color, background: DEPTS[popover.act.dept].bg, borderColor: DEPTS[popover.act.dept].line }}>{DEPTS[popover.act.dept].short}</span>
              <button className="iconbtn" style={{ width: 26, height: 26, border: 'none' }} onClick={() => setPopover(null)}><Icon name="x" size={15} /></button>
            </div>
            <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{popover.act.title}</div>
            <div className="stack" style={{ gap: 7, marginTop: 11 }}>
              <div className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}><span style={{ color: 'var(--muted)' }}><Icon name="building" size={15} /></span>{DEPTS[popover.act.dept].name}</div>
              <div className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}><span style={{ color: 'var(--muted)' }}><Icon name="calendar" size={15} /></span>{String(popover.act.startD).padStart(2, '0')} – {String(popover.act.endD).padStart(2, '0')} juin 2026</div>
              <div className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}><span style={{ color: 'var(--muted)' }}><Icon name="users" size={15} /></span>{popover.act.people.length} participants</div>
            </div>
            <div className="between" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
              <StatusBadge status={popover.act.status} />
              <button className="btn primary sm" onClick={() => navigate(`/activities/${popover.act.id}`)}>
                Détails <Icon name="arrowRight" size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
