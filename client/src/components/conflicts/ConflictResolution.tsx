import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from '../ui/Icon'
import { Person, StatusBadge } from '../ui/common'
import { ACTIVITIES, AVAILABLE, CONFLICTS, DEPTS, STAFF, initials, type Activity } from '../../lib/mock'

interface ResolvedConflict {
  id: string
  staff: string
  activities: string[]
  overlap: string
  resolved: boolean
  resolution: 'replace' | 'remove' | 'ignore' | null
  replId?: string | null
  replNew?: { name: string; role: string } | null
  replActId?: string | null
}

function ManualPerson({ name, role }: { name: string; role: string }) {
  const ini = (initials(name || '') || 'N').toUpperCase()
  return (
    <div className="person">
      <div className="pa" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}>{ini}</div>
      <div className="stack" style={{ flex: 1, minWidth: 0 }}>
        <div className="pn">{name || 'Nouvel intervenant'}</div>
        <div className="pr">{role || 'Saisi manuellement'}</div>
      </div>
    </div>
  )
}

export default function ConflictResolution() {
  const navigate = useNavigate()
  const [list, setList] = useState<ResolvedConflict[]>(CONFLICTS.map((c) => ({ ...c, resolved: false, resolution: null })))
  const [sel, setSel] = useState(0)
  const [expand, setExpand] = useState<string | null>(null)
  const [tab, setTab] = useState<'list' | 'manual'>('list')
  const [mName, setMName] = useState('')
  const [mRole, setMRole] = useState('')

  const active = list[sel]
  const staff = STAFF[active.staff]
  const acts = active.activities.map((id) => ACTIVITIES.find((a) => a.id === id)!)

  function selectConflict(i: number) {
    setSel(i)
    setExpand(null)
    setTab('list')
    setMName('')
    setMRole('')
  }
  function toggleExpand(actId: string) {
    setExpand((e) => (e === actId ? null : actId))
    setTab('list')
  }
  function resolve(kind: 'replace' | 'remove' | 'ignore', payload: Partial<ResolvedConflict> = {}) {
    setList((l) => l.map((c, i) => (i === sel ? { ...c, resolved: true, resolution: kind, replId: null, replNew: null, replActId: null, ...payload } : c)))
    setExpand(null)
    setMName('')
    setMRole('')
  }
  function reopen() {
    setList((l) => l.map((c, i) => (i === sel ? { ...c, resolved: false, resolution: null, replId: null, replNew: null, replActId: null } : c)))
  }

  const replacementsFor = (a: Activity) => AVAILABLE.map((id) => STAFF[id]).filter((r) => !a.people.includes(r.id))
  const dateLabel = (a: Activity) =>
    a.startD > 0 ? `${String(a.startD).padStart(2, '0')} – ${String(a.endD).padStart(2, '0')} juin 2026` : '26 – 27 mai 2026'

  const remaining = list.filter((c) => !c.resolved).length
  const replName = active.replNew ? active.replNew.name : active.replId ? STAFF[active.replId].name : ''

  function ReplacePanel({ a }: { a: Activity }) {
    const sugg = replacementsFor(a)
    return (
      <div style={{ borderLeft: '3px solid var(--blue)', background: 'var(--blue-50)', borderRadius: '0 6px 6px 0', margin: '4px 0 8px', padding: '12px 14px' }}>
        <div className="row" style={{ gap: 6, marginBottom: 12 }}>
          <button className={'rtab' + (tab === 'list' ? ' on' : '')} onClick={() => setTab('list')}>Choisir dans la liste</button>
          <button className={'rtab' + (tab === 'manual' ? ' on' : '')} onClick={() => setTab('manual')}>Saisir un nouveau nom</button>
        </div>

        {tab === 'list' ? (
          <div className="stack" style={{ gap: 6 }}>
            <div className="muted" style={{ fontSize: 11.5, marginBottom: 2 }}>Agents non assignés sur la période {active.overlap}.</div>
            <div className="stack" style={{ gap: 6, maxHeight: 184, overflowY: 'auto' }}>
              {sugg.map((r) => (
                <div key={r.id} className="between" style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 6, padding: '7px 10px' }}>
                  <div className="row" style={{ gap: 10 }}>
                    <Person id={r.id} />
                    <span className="badge green" style={{ fontSize: 10.5 }}><span className="pip" />Disponible</span>
                  </div>
                  <button className="btn sm primary" onClick={() => resolve('replace', { replActId: a.id, replId: r.id })}><Icon name="swap" size={14} /> Choisir</button>
                </div>
              ))}
              {sugg.length === 0 && <div className="muted" style={{ fontSize: 12, padding: '8px 2px' }}>Aucun agent disponible — saisissez un nouveau nom.</div>}
            </div>
          </div>
        ) : (
          <div className="stack" style={{ gap: 12 }}>
            <div className="grid-2">
              <div className="field">
                <label>Nom complet</label>
                <input className="input" placeholder="ex. Dr ADJO Yawo" value={mName} onChange={(e) => setMName(e.target.value)} />
              </div>
              <div className="field">
                <label>Titre / Rôle</label>
                <input className="input" placeholder="ex. Biologiste, INH" value={mRole} onChange={(e) => setMRole(e.target.value)} />
              </div>
            </div>
            <div className="row" style={{ gap: 10 }}>
              <button className="btn primary sm" disabled={!mName.trim()} onClick={() => resolve('replace', { replActId: a.id, replNew: { name: mName.trim(), role: mRole.trim() } })}>
                <Icon name="check" size={15} /> Confirmer le remplacement
              </button>
              <span className="muted" style={{ fontSize: 11.5 }}>Cette personne sera marquée « Nouveau » — non encore enregistrée dans le système.</span>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          <h1 className="page-title">Résolution des conflits</h1>
          <p className="page-desc">{remaining > 0 ? `${remaining} conflit${remaining > 1 ? 's' : ''} de ressources humaines à arbitrer` : 'Tous les conflits ont été traités'}</p>
        </div>
        <button className="btn" onClick={() => navigate('/dashboard')}><Icon name="chevronLeft" size={16} /> Tableau de bord</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>
        {/* Conflict list */}
        <div className="card">
          <div className="card-head"><h2 className="card-title">Conflits</h2><span className="badge red">{remaining}</span></div>
          <div>
            {list.map((c, i) => {
              const p = STAFF[c.staff]
              return (
                <div
                  key={c.id}
                  onClick={() => selectConflict(i)}
                  style={{
                    padding: '13px 16px',
                    borderBottom: '1px solid var(--line)',
                    cursor: 'pointer',
                    background: i === sel ? 'var(--blue-50)' : 'transparent',
                    borderLeft: i === sel ? '3px solid var(--blue)' : '3px solid transparent',
                  }}
                >
                  <div className="between">
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{p.name}</div>
                    {c.resolved ? (
                      <span className="badge green" style={{ fontSize: 10.5 }}><Icon name="check" size={12} /> Traité</span>
                    ) : (
                      <span className="badge red" style={{ fontSize: 10.5 }}><span className="pip" /></span>
                    )}
                  </div>
                  <div className="muted" style={{ fontSize: 12, marginTop: 3 }}>{c.activities.length} activités · {c.overlap}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Comparison + actions */}
        <div className="stack" style={{ gap: 20 }}>
          <div
            className="between"
            style={{
              border: '1px solid ' + (active.resolved ? 'var(--green-line)' : 'var(--red-line)'),
              background: active.resolved ? 'var(--green-bg)' : 'var(--red-bg)',
              borderRadius: 8,
              padding: '14px 18px',
            }}
          >
            <div className="row" style={{ gap: 12 }}>
              <span style={{ color: active.resolved ? 'var(--green)' : 'var(--red)' }}><Icon name={active.resolved ? 'check' : 'alert'} size={20} /></span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14 }}>{staff.name}</div>
                <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>
                  {active.resolved
                    ? active.resolution === 'replace'
                      ? (<>Remplacé(e) par <strong>{replName}</strong>{active.replNew ? ' (nouveau)' : ''} sur une activité.</>)
                      : active.resolution === 'remove'
                        ? "Retiré(e) de l'activité en conflit."
                        : 'Conflit ignoré — maintenu sur les deux activités.'
                    : (<>Programmé(e) sur deux activités qui se chevauchent du <strong>{active.overlap}</strong>.</>)}
                </div>
              </div>
            </div>
            {staff && <span className="badge slate">{staff.role} · {DEPTS[staff.dept].short}</span>}
          </div>

          {/* side-by-side */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
            {acts.map((a) => (
              <div className="card" key={a.id}>
                <div style={{ height: 4, background: DEPTS[a.dept].color, borderRadius: '8px 8px 0 0' }} />
                <div className="card-body" style={{ paddingBottom: 6 }}>
                  <div className="row" style={{ gap: 8, marginBottom: 8 }}>
                    <span className="badge" style={{ color: DEPTS[a.dept].color, background: DEPTS[a.dept].bg, borderColor: DEPTS[a.dept].line }}>{DEPTS[a.dept].short}</span>
                    <StatusBadge status={a.status} />
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>{a.title}</div>
                  <div className="stack" style={{ gap: 6, marginTop: 12 }}>
                    <div className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: 12.5 }}><Icon name="calendar" size={15} /><span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{dateLabel(a)}</span></div>
                    <div className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: 12.5 }}><Icon name="mapPin" size={15} /><span>{a.venue}</span></div>
                    <div className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: 12.5 }}><Icon name="hash" size={15} /><span className="mono">{a.ref}</span></div>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid var(--line)', padding: '10px 18px 4px' }}>
                  <div className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em', marginBottom: 4 }}>Participants ({a.people.length})</div>
                </div>
                <div style={{ padding: '0 12px 12px' }}>
                  {a.people.map((pid) => {
                    const isConflict = pid === active.staff && !active.resolved
                    const replacedHere = pid === active.staff && active.resolved && active.resolution === 'replace' && active.replActId === a.id
                    const removedHere = pid === active.staff && active.resolved && active.resolution === 'remove' && a.id === acts[acts.length - 1].id
                    const open = expand === a.id
                    return (
                      <div key={pid}>
                        <div
                          style={{
                            borderRadius: 6,
                            padding: '7px 8px',
                            background: isConflict ? 'var(--red-bg)' : 'transparent',
                            border: isConflict ? '1px solid var(--red-line)' : '1px solid transparent',
                            marginBottom: 2,
                            opacity: removedHere ? 0.45 : 1,
                          }}
                        >
                          <div className="between">
                            {replacedHere && active.replNew ? (
                              <ManualPerson name={active.replNew.name} role={active.replNew.role} />
                            ) : (
                              <Person id={replacedHere ? active.replId! : pid} conflict={isConflict} />
                            )}
                            <div className="row" style={{ gap: 8, flex: 'none' }}>
                              {isConflict && (
                                <>
                                  <span className="badge red" style={{ fontSize: 10.5 }}><span className="pip" />Conflit</span>
                                  <button className="btn sm" onClick={() => toggleExpand(a.id)}>
                                    <Icon name={open ? 'chevronDown' : 'swap'} size={14} /> {open ? 'Fermer' : 'Remplacer'}
                                  </button>
                                </>
                              )}
                              {replacedHere &&
                                (active.replNew ? (
                                  <span className="badge blue" style={{ fontSize: 10.5 }}><span className="pip" />Nouveau</span>
                                ) : (
                                  <span className="badge green" style={{ fontSize: 10.5 }}><Icon name="swap" size={12} /> Remplacé</span>
                                ))}
                              {removedHere && <span className="badge slate" style={{ fontSize: 10.5, textDecoration: 'line-through' }}>Retiré</span>}
                            </div>
                          </div>
                        </div>
                        {isConflict && open && <ReplacePanel a={a} />}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* other actions */}
          {!active.resolved ? (
            <div className="card">
              <div className="card-head"><h2 className="card-title">Autres actions</h2></div>
              <div className="card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
                <div className="muted" style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 480 }}>
                  Utilisez <strong style={{ color: 'var(--ink-2)' }}>« Remplacer »</strong> sur l'agent en conflit ci-dessus pour le substituer. Sinon : « Retirer » le libère de l'activité la plus récente, « Ignorer » consigne le conflit sans le résoudre.
                </div>
                <div className="row" style={{ gap: 10 }}>
                  <button className="btn danger" onClick={() => resolve('remove')}><Icon name="x" size={16} /> Retirer de la 2ᵉ activité</button>
                  <button className="btn" onClick={() => resolve('ignore')}><Icon name="check" size={16} /> Ignorer</button>
                </div>
              </div>
            </div>
          ) : (
            <div className="between" style={{ border: '1px solid var(--line)', borderRadius: 8, padding: '16px 20px' }}>
              <div className="row" style={{ gap: 10, color: 'var(--green)' }}><Icon name="check" size={18} /><span style={{ color: 'var(--ink)', fontWeight: 600, fontSize: 13.5 }}>Conflit traité.</span></div>
              <button className="btn sm" onClick={reopen}>Annuler l'arbitrage</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
