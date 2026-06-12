import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { StatusBadge } from '../../components/ui/common'
import { DEPTS } from '../../lib/mock'
import { useCalendarActivities } from '../../hooks/useActivities'
import { deptMeta, STATUS_LABEL, STATUS_FILTERS, fmtRange, type ApiCalendarActivity, type ApiActivityStatus } from '../../lib/api'

interface Popover { act: ApiCalendarActivity; x: number; y: number }

const MONTHS_FR = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
const DOWS = ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim']

export default function CalendarPage() {
  const navigate = useNavigate()
  const [cursor, setCursor] = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [deptFilter, setDeptFilter] = useState<string[]>(Object.keys(DEPTS))
  const [statusFilter, setStatusFilter] = useState<'Tous' | ApiActivityStatus>('Tous')
  const [popover, setPopover] = useState<Popover | null>(null)

  const monthStart = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-01`
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate()
  const monthEnd = `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(daysInMonth).padStart(2, '0')}`
  const { data: acts = [] } = useCalendarActivities({ from: monthStart, to: monthEnd })

  const toggleDept = (id: string) => setDeptFilter((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]))

  const firstDow = (new Date(cursor.y, cursor.m, 1).getDay() + 6) % 7
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  const matches = (a: ApiCalendarActivity) =>
    (deptFilter.includes(a.department) || !(a.department in DEPTS)) &&
    (statusFilter === 'Tous' || a.status === statusFilter)

  const dayIso = (d: number) => `${cursor.y}-${String(cursor.m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
  const actsOnDay = (d: number) => acts.filter((a) => matches(a) && a.startDate <= dayIso(d) && a.endDate >= dayIso(d))

  const today = new Date()
  const todayNum = today.getFullYear() === cursor.y && today.getMonth() === cursor.m ? today.getDate() : -1

  const prevMonth = () => setCursor((c) => (c.m === 0 ? { y: c.y - 1, m: 11 } : { y: c.y, m: c.m - 1 }))
  const nextMonth = () => setCursor((c) => (c.m === 11 ? { y: c.y + 1, m: 0 } : { y: c.y, m: c.m + 1 }))

  return (
    <div className="content" onClick={() => setPopover(null)}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Calendrier général</h1>
          <p className="page-desc">Toutes les activités institutionnelles · {MONTHS_FR[cursor.m]} {cursor.y}</p>
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
                <button key={d.id} className="chip" onClick={() => toggleDept(d.id)}
                  style={{ height: 32, fontSize: 12.5, borderColor: on ? d.color : 'var(--line-strong)', background: on ? d.bg : 'var(--card)', color: on ? d.color : 'var(--muted)' }}>
                  <span style={{ width: 9, height: 9, borderRadius: 2, background: on ? d.color : 'var(--muted-2)' }} />
                  {d.short}
                </button>
              )
            })}
          </div>
          <select className="select" style={{ height: 34, width: 160 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as 'Tous' | ApiActivityStatus)}>
            <option value="Tous">Tous les statuts</option>
            {STATUS_FILTERS.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      {/* Calendar grid */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <div className="between" style={{ padding: '14px 18px', borderBottom: '1px solid var(--line)' }}>
          <h2 className="card-title" style={{ fontSize: 16 }}>{MONTHS_FR[cursor.m][0].toUpperCase() + MONTHS_FR[cursor.m].slice(1)} {cursor.y}</h2>
          <div className="row" style={{ gap: 8 }}>
            <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={(e) => { e.stopPropagation(); prevMonth() }}><Icon name="chevronLeft" size={16} /></button>
            <button className="iconbtn" style={{ width: 32, height: 32 }} onClick={(e) => { e.stopPropagation(); nextMonth() }}><Icon name="chevronRight" size={16} /></button>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
          {DOWS.map((d) => (
            <div key={d} style={{ padding: '9px 12px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', color: 'var(--muted)', borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)' }}>{d}</div>
          ))}
          {cells.map((d, i) => {
            const dayActs = d ? actsOnDay(d) : []
            const hasConflict = dayActs.some((a) => a._count?.conflictsAsMain > 0)
            return (
              <div key={i} style={{ minHeight: 116, borderBottom: '1px solid var(--line)', borderRight: '1px solid var(--line)', padding: '7px 7px 8px', background: d ? 'var(--card)' : '#FBFCFD' }}>
                {d && (
                  <div className="between" style={{ marginBottom: 5 }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: d === todayNum ? 'var(--blue-700)' : 'var(--ink-2)', background: d === todayNum ? 'var(--blue-50)' : 'transparent', borderRadius: 4, padding: '1px 6px' }}>{String(d).padStart(2, '0')}</span>
                    {hasConflict && <span title="Conflit ce jour" style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--red)' }} />}
                  </div>
                )}
                <div className="stack" style={{ gap: 3 }}>
                  {dayActs.slice(0, 3).map((a) => {
                    const dm = deptMeta(a.department)
                    return (
                      <div key={a.id} onClick={(e) => { e.stopPropagation(); setPopover({ act: a, x: e.clientX, y: e.clientY }) }} title={a.title}
                        style={{ fontSize: 11, fontWeight: 600, color: dm.color, background: dm.bg, borderLeft: '3px solid ' + dm.color, borderRadius: 3, padding: '3px 6px', cursor: 'pointer', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.title}
                      </div>
                    )
                  })}
                  {dayActs.length > 3 && <div className="muted" style={{ fontSize: 11, fontWeight: 600, paddingLeft: 4 }}>+{dayActs.length - 3} autre(s)</div>}
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
      {popover && (() => {
        const dm = deptMeta(popover.act.department)
        return (
          <div onClick={(e) => e.stopPropagation()}
            style={{ position: 'fixed', zIndex: 50, left: Math.min(popover.x, window.innerWidth - 320), top: Math.min(popover.y + 10, window.innerHeight - 240), width: 300, background: 'var(--card)', border: '1px solid var(--line-strong)', borderRadius: 8, boxShadow: '0 8px 28px rgba(20,40,70,.16)' }}>
            <div style={{ height: 4, background: dm.color, borderRadius: '8px 8px 0 0' }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="between" style={{ marginBottom: 8 }}>
                <span className="badge" style={{ color: dm.color, background: dm.bg, borderColor: dm.line }}>{dm.short}</span>
                <button className="iconbtn" style={{ width: 26, height: 26, border: 'none' }} onClick={() => setPopover(null)}><Icon name="x" size={15} /></button>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, lineHeight: 1.3 }}>{popover.act.title}</div>
              <div className="stack" style={{ gap: 7, marginTop: 11 }}>
                <div className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}><span style={{ color: 'var(--muted)' }}><Icon name="building" size={15} /></span>{dm.name || popover.act.department}</div>
                <div className="row" style={{ gap: 8, fontSize: 12.5, color: 'var(--ink-2)' }}><span style={{ color: 'var(--muted)' }}><Icon name="calendar" size={15} /></span>{fmtRange(popover.act.startDate, popover.act.endDate)}</div>
              </div>
              <div className="between" style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--line)' }}>
                <StatusBadge status={STATUS_LABEL[popover.act.status]} />
                <button className="btn primary sm" onClick={() => navigate(`/activities/${popover.act.id}`)}>
                  Détails <Icon name="arrowRight" size={14} />
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
