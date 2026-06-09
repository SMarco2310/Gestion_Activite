import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon, { type IconName } from '../../components/ui/Icon'
import { Person, StatusBadge } from '../../components/ui/common'
import { AVAILABLE, DEPTS, STAFF } from '../../lib/mock'

function Stepper({ step }: { step: number }) {
  const steps = ['Informations', 'Participants', 'Document', 'Confirmation']
  return (
    <div className="card" style={{ padding: '16px 22px', marginBottom: 20 }}>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${steps.length},1fr)`, gap: 0 }}>
        {steps.map((s, i) => {
          const n = i + 1
          const done = n < step
          const active = n === step
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
              <div className="row" style={{ gap: 10, flex: 'none' }}>
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    flex: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 13,
                    background: done ? 'var(--blue)' : active ? 'var(--blue-50)' : 'var(--card)',
                    color: done ? '#fff' : active ? 'var(--blue-700)' : 'var(--muted)',
                    border: '1px solid ' + (done || active ? 'var(--blue)' : 'var(--line-strong)'),
                  }}
                >
                  {done ? <Icon name="check" size={15} /> : n}
                </span>
                <span style={{ fontWeight: 700, fontSize: 13, color: active || done ? 'var(--ink)' : 'var(--muted)' }}>{s}</span>
              </div>
              {i < steps.length - 1 && <span style={{ flex: 1, height: 2, margin: '0 14px', background: done ? 'var(--blue)' : 'var(--line)' }} />}
            </div>
          )
        })}
      </div>
    </div>
  )
}

interface PType { id: string; status: 'Disponible' | 'Conflit' }

const EXTRACTED = {
  fields: { title: "Atelier de validation du plan d'action sectoriel", dept: 'INH', type: 'Atelier', start: '2026-06-16', end: '2026-06-17', venue: 'Hôtel SARAKAWA, Lomé', ref: '' },
  found: { title: true, dept: true, type: true, start: true, end: true, venue: true, ref: false } as Record<string, boolean>,
  participants: [
    { id: 'sanni', status: 'Disponible' },
    { id: 'tossa', status: 'Disponible' },
    { id: 'foli', status: 'Disponible' },
    { id: 'assih', status: 'Conflit' },
  ] as PType[],
}

export default function NewActivityPage() {
  const navigate = useNavigate()
  const [view, setView] = useState<'gate' | 'upload' | 'verify' | 'form'>('gate')
  const [step, setStep] = useState(1)
  const [autofilled, setAutofilled] = useState<Record<string, boolean> | null>(null)
  const [f, setF] = useState({ title: '', dept: 'INH', type: 'Atelier', start: '', end: '', venue: '', ref: '', urgent: false })
  const [participants, setParticipants] = useState<PType[]>([
    { id: 'sanni', status: 'Disponible' },
    { id: 'assih', status: 'Conflit' },
    { id: 'bidjada', status: 'Conflit' },
    { id: 'tossa', status: 'Disponible' },
  ])
  const [query, setQuery] = useState('')
  const [file, setFile] = useState<{ name: string; size: string; type: string } | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const set = (k: string, v: unknown) => setF((p) => ({ ...p, [k]: v }))

  function startManual() {
    setF({ title: '', dept: 'INH', type: 'Atelier', start: '', end: '', venue: '', ref: '', urgent: false })
    setParticipants([
      { id: 'sanni', status: 'Disponible' },
      { id: 'assih', status: 'Conflit' },
      { id: 'bidjada', status: 'Conflit' },
      { id: 'tossa', status: 'Disponible' },
    ])
    setAutofilled(null)
    setStep(1)
    setView('form')
  }
  function importDoc() {
    setFile({ name: 'TDR_Atelier_validation_plan_action.pdf', size: '312 Ko', type: 'pdf' })
    setF((p) => ({ ...p, ...EXTRACTED.fields, urgent: false }))
    setParticipants(EXTRACTED.participants)
    setAutofilled(EXTRACTED.found)
    setView('verify')
  }

  const types = ['Atelier', 'Formation', 'Mission', 'Réunion', 'Autre']
  const addable = Object.values(STAFF).filter(
    (s) =>
      !participants.find((p) => p.id === s.id) &&
      (query.trim() === '' || s.name.toLowerCase().includes(query.toLowerCase()) || s.role.toLowerCase().includes(query.toLowerCase())),
  )
  const addPerson = (id: string) => {
    setParticipants((p) => [...p, { id, status: 'Disponible' }])
    setQuery('')
  }
  const removePerson = (id: string) => setParticipants((p) => p.filter((x) => x.id !== id))
  const replacePerson = (id: string) => {
    const repl = AVAILABLE.find((rid) => !participants.find((p) => p.id === rid))
    if (repl) setParticipants((p) => p.map((x) => (x.id === id ? { id: repl, status: 'Disponible' } : x)))
  }
  const conflicts = participants.filter((p) => p.status === 'Conflit').length
  const canNext = step === 1 ? Boolean(f.title.trim() && f.start && f.end) : true

  function pickFile() {
    setFile({ name: 'TDR_Atelier_redaction_manuscrits.pdf', size: '248 Ko', type: 'pdf' })
  }

  const headDesc = {
    gate: "Choisissez comment renseigner l'activité",
    upload: 'Téléversez le document de termes de référence à analyser',
    verify: 'Vérifiez les informations extraites de votre document',
    form: 'Soumettez les termes de référence et la liste des participants',
  }[view]

  /* ============ GATE ============ */
  if (view === 'gate') {
    const cards: { key: string; ico: IconName; title: string; desc: string; badge: string | null; onClick: () => void }[] = [
      { key: 'manual', ico: 'edit', title: 'Remplir manuellement', desc: "Saisissez les informations de l'activité étape par étape.", badge: null, onClick: startManual },
      { key: 'import', ico: 'fileImport', title: 'Importer un document TDR', desc: 'Téléversez votre fichier PDF ou Word — les champs seront remplis automatiquement.', badge: 'Recommandé', onClick: () => setView('upload') },
    ]
    return (
      <div className="content" style={{ maxWidth: 880 }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Nouvelle activité</h1>
            <p className="page-desc">{headDesc}</p>
          </div>
          <button className="btn" onClick={() => navigate('/dashboard')}>Annuler</button>
        </div>
        <div className="grid-2" style={{ gap: 18 }}>
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={c.onClick}
              className="card method-card"
              style={{ textAlign: 'left', cursor: 'pointer', padding: '26px 24px', display: 'flex', flexDirection: 'column', gap: 14, font: 'inherit', position: 'relative' }}
            >
              {c.badge && <span className="badge blue" style={{ position: 'absolute', top: 16, right: 16 }}><span className="pip" />{c.badge}</span>}
              <span style={{ width: 52, height: 52, borderRadius: 10, background: 'var(--blue-50)', color: 'var(--blue-700)', border: '1px solid var(--blue-100)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={c.ico} size={26} />
              </span>
              <div>
                <div style={{ fontWeight: 800, fontSize: 16.5, letterSpacing: '-0.01em' }}>{c.title}</div>
                <div className="muted" style={{ fontSize: 13, marginTop: 6, lineHeight: 1.5, maxWidth: 300 }}>{c.desc}</div>
              </div>
              <span className="row" style={{ gap: 7, color: 'var(--blue-700)', fontWeight: 700, fontSize: 13, marginTop: 2 }}>
                Continuer <Icon name="arrowRight" size={15} />
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  /* ============ UPLOAD ============ */
  if (view === 'upload') {
    return (
      <div className="content" style={{ maxWidth: 780 }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Importer un document TDR</h1>
            <p className="page-desc">{headDesc}</p>
          </div>
          <button className="btn" onClick={() => setView('gate')}><Icon name="chevronLeft" size={16} /> Retour</button>
        </div>
        <div className="card">
          <div className="card-body" style={{ padding: '24px 26px' }}>
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => { e.preventDefault(); setDragOver(false); importDoc() }}
              onClick={importDoc}
              style={{ border: '1.5px dashed ' + (dragOver ? 'var(--blue)' : 'var(--line-strong)'), background: dragOver ? 'var(--blue-50)' : 'var(--bg)', borderRadius: 8, padding: '54px 20px', textAlign: 'center', cursor: 'pointer' }}
            >
              <div style={{ color: 'var(--blue)', display: 'flex', justifyContent: 'center', marginBottom: 14 }}><Icon name="fileImport" size={34} /></div>
              <div style={{ fontWeight: 700, fontSize: 15 }}>Glissez votre fichier ici, ou cliquez pour parcourir</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 5 }}>PDF ou Word (.doc, .docx) · 10 Mo max</div>
            </div>
            <div className="row" style={{ gap: 10, marginTop: 18, color: 'var(--blue-700)' }}>
              <Icon name="sparkle" size={17} />
              <span style={{ fontSize: 12.5, color: 'var(--ink-2)', fontWeight: 600 }}>
                À l'issue du téléversement, les champs de l'activité et la liste des participants seront extraits automatiquement pour vérification.
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  /* ============ VERIFY ============ */
  if (view === 'verify') {
    const af = autofilled || {}
    const conflictsV = participants.filter((p) => p.status === 'Conflit').length
    const Field = ({ name, label, children }: { name: string; label: string; children: ReactNode }) => {
      const filled = af[name] === true
      const missing = af[name] === false
      return (
        <div className="field">
          <label>{label}</label>
          <div className={'af-wrap' + (filled ? ' filled' : '') + (missing ? ' missing' : '')}>{children}</div>
          {filled && <span className="af-tag extract"><Icon name="sparkle" size={12} /> Extrait du document</span>}
          {missing && <span className="af-tag missing"><Icon name="alert" size={12} /> Non trouvé — à compléter</span>}
        </div>
      )
    }
    return (
      <div className="content" style={{ maxWidth: 1000 }}>
        <div className="page-head">
          <div>
            <h1 className="page-title">Vérification des données extraites</h1>
            <p className="page-desc">{headDesc}</p>
          </div>
          <button className="btn" onClick={() => setView('gate')}>Annuler</button>
        </div>

        {file && (
          <div className="between" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '12px 16px', marginBottom: 16, background: 'var(--card)' }}>
            <div className="row" style={{ gap: 12 }}>
              <span style={{ width: 38, height: 38, borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={19} /></span>
              <div><div style={{ fontWeight: 700, fontSize: 13 }}>{file.name}</div><div className="muted" style={{ fontSize: 12 }}>{file.size} · PDF · analysé à l'instant</div></div>
            </div>
            <button className="btn ghost sm" onClick={() => setView('upload')}><Icon name="refresh" size={14} /> Changer de fichier</button>
          </div>
        )}

        <div className="row" style={{ gap: 11, alignItems: 'flex-start', border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
          <span style={{ color: 'var(--amber)', marginTop: 1 }}><Icon name="sparkle" size={18} /></span>
          <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600, lineHeight: 1.5 }}>
            Les champs ci-dessous ont été remplis automatiquement à partir de votre document. Veuillez vérifier et corriger si nécessaire avant de continuer.
          </span>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head"><h2 className="card-title">Informations sur l'activité</h2></div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <Field name="title" label="Intitulé de l'activité">
              <input className="input" value={f.title} onChange={(e) => set('title', e.target.value)} placeholder="Intitulé de l'activité" />
            </Field>
            <div className="grid-2">
              <Field name="dept" label="Département organisateur">
                <select className="select" value={f.dept} onChange={(e) => set('dept', e.target.value)}>
                  {Object.values(DEPTS).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </Field>
              <Field name="ref" label="Référence du document">
                <input className="input mono" value={f.ref} onChange={(e) => set('ref', e.target.value)} placeholder="INH/2026/000" />
              </Field>
            </div>
            <div className="grid-3">
              <Field name="type" label="Type d'activité">
                <select className="select" value={f.type} onChange={(e) => set('type', e.target.value)}>
                  {types.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field name="start" label="Date de début">
                <input className="input" type="date" value={f.start} onChange={(e) => set('start', e.target.value)} />
              </Field>
              <Field name="end" label="Date de fin">
                <input className="input" type="date" value={f.end} onChange={(e) => set('end', e.target.value)} />
              </Field>
            </div>
            <Field name="venue" label="Lieu">
              <input className="input" value={f.venue} onChange={(e) => set('venue', e.target.value)} placeholder="Lieu" />
            </Field>
          </div>
        </div>

        <div className="card" style={{ marginBottom: 20 }}>
          <div className="card-head">
            <h2 className="card-title">Participants extraits ({participants.length})</h2>
            {conflictsV > 0 ? (
              <span className="badge red"><span className="pip" />{conflictsV} conflit{conflictsV > 1 ? 's' : ''} détecté{conflictsV > 1 ? 's' : ''}</span>
            ) : (
              <span className="badge green"><span className="pip" />Aucun conflit</span>
            )}
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Agent</th><th>Fonction</th><th>Département</th><th style={{ textAlign: 'right' }}>Disponibilité</th></tr>
            </thead>
            <tbody>
              {participants.map((pp) => {
                const p = STAFF[pp.id]
                const conflict = pp.status === 'Conflit'
                return (
                  <tr key={pp.id} style={{ background: conflict ? 'var(--red-bg)' : 'transparent' }}>
                    <td><Person id={pp.id} conflict={conflict} /></td>
                    <td className="muted">{p.role}</td>
                    <td className="muted">{DEPTS[p.dept].short}</td>
                    <td style={{ textAlign: 'right' }}>
                      {conflict ? <span className="badge red"><span className="pip" />Conflit</span> : <span className="badge green"><span className="pip" />Disponible</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="muted" style={{ fontSize: 12, padding: '12px 18px', borderTop: '1px solid var(--line)' }}>
            La disponibilité a été vérifiée automatiquement par rapport au calendrier existant sur la période extraite.
          </div>
        </div>

        <div className="between">
          <button className="btn" onClick={startManual}><Icon name="refresh" size={15} /> Recommencer manuellement</button>
          <button className="btn primary" onClick={() => { setStep(4); setView('form') }}>
            <Icon name="check" size={16} /> Corriger et soumettre
          </button>
        </div>
      </div>
    )
  }

  /* ============ FORM (4-step wizard) ============ */
  return (
    <div className="content" style={{ maxWidth: 1000 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Nouvelle activité</h1>
          <p className="page-desc">{headDesc}</p>
        </div>
        <button className="btn" onClick={() => navigate('/dashboard')}>Annuler</button>
      </div>

      <Stepper step={step} />

      <div className="card">
        <div className="card-body" style={{ padding: '24px 26px' }}>
          {/* STEP 1 */}
          {step === 1 && (
            <div className="stack" style={{ gap: 18 }}>
              <div className="field">
                <label>Intitulé de l'activité</label>
                <input className="input" placeholder="ex. Atelier de rédaction de manuscrits scientifiques" value={f.title} onChange={(e) => set('title', e.target.value)} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Département organisateur</label>
                  <select className="select" value={f.dept} onChange={(e) => set('dept', e.target.value)}>
                    {Object.values(DEPTS).map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>Référence du document</label>
                  <input className="input mono" placeholder="INH/2026/000" value={f.ref} onChange={(e) => set('ref', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Type d'activité</label>
                <div className="chips">
                  {types.map((t) => (
                    <button key={t} className={'chip' + (f.type === t ? ' on' : '')} onClick={() => set('type', t)}>{t}</button>
                  ))}
                </div>
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Date de début</label>
                  <input className="input" type="date" value={f.start} onChange={(e) => set('start', e.target.value)} />
                </div>
                <div className="field">
                  <label>Date de fin</label>
                  <input className="input" type="date" value={f.end} onChange={(e) => set('end', e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Lieu</label>
                <input className="input" placeholder="ex. Hôtel MORIJA, Tsévié" value={f.venue} onChange={(e) => set('venue', e.target.value)} />
              </div>
              <div className="between" style={{ border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 6, padding: '14px 16px' }}>
                <div style={{ maxWidth: 560 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--amber)' }}>Activité urgente / hors cycle</div>
                  <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 2 }}>Pour les activités de dernière minute soumises en dehors du cycle normal de planification.</div>
                </div>
                <button className={'toggle' + (f.urgent ? ' on' : '')} onClick={() => set('urgent', !f.urgent)}><span className="knob" /></button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div className="stack" style={{ gap: 16 }}>
              <div className="between">
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>Participants ({participants.length})</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>La disponibilité est vérifiée automatiquement sur la période choisie.</div>
                </div>
                {conflicts > 0 && <span className="badge red"><span className="pip" />{conflicts} conflit{conflicts > 1 ? 's' : ''} détecté{conflicts > 1 ? 's' : ''}</span>}
              </div>

              <div className="field" style={{ position: 'relative' }}>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--muted)' }}><Icon name="search" size={17} /></span>
                  <input className="input" style={{ paddingLeft: 38 }} placeholder="Rechercher un agent par nom ou fonction…" value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                {query.trim() && (
                  <div className="card" style={{ position: 'absolute', top: 46, left: 0, right: 0, zIndex: 5, maxHeight: 240, overflowY: 'auto' }}>
                    {addable.length === 0 && <div style={{ padding: 14 }} className="muted">Aucun agent trouvé.</div>}
                    {addable.map((s) => (
                      <div key={s.id} className="between" style={{ padding: '9px 14px', borderBottom: '1px solid var(--line)', cursor: 'pointer' }} onClick={() => addPerson(s.id)}>
                        <Person id={s.id} />
                        <span className="btn ghost sm"><Icon name="plus" size={15} /> Ajouter</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="card">
                {participants.map((pp, idx) => {
                  const conflict = pp.status === 'Conflit'
                  return (
                    <div key={pp.id} className="between" style={{ padding: '12px 16px', borderBottom: idx < participants.length - 1 ? '1px solid var(--line)' : 'none', background: conflict ? 'var(--red-bg)' : 'transparent' }}>
                      <Person id={pp.id} conflict={conflict} />
                      <div className="row" style={{ gap: 10 }}>
                        {conflict ? <span className="badge red"><span className="pip" />Conflit</span> : <span className="badge green"><span className="pip" />Disponible</span>}
                        {conflict && <button className="btn sm" onClick={() => replacePerson(pp.id)}><Icon name="swap" size={14} /> Remplacer</button>}
                        <button className="iconbtn" style={{ width: 30, height: 30 }} title="Retirer" onClick={() => removePerson(pp.id)}><Icon name="x" size={15} /></button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div className="stack" style={{ gap: 16 }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Document de termes de référence (TDR)</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Formats acceptés : PDF, Word (.doc, .docx) — 10 Mo maximum.</div>
              </div>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); pickFile() }}
                onClick={pickFile}
                style={{ border: '1.5px dashed ' + (dragOver ? 'var(--blue)' : 'var(--line-strong)'), background: dragOver ? 'var(--blue-50)' : 'var(--bg)', borderRadius: 8, padding: '46px 20px', textAlign: 'center', cursor: 'pointer' }}
              >
                <div style={{ color: 'var(--blue)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="upload" size={30} /></div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Glissez votre fichier ici, ou cliquez pour parcourir</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>PDF ou Word · 10 Mo max</div>
              </div>
              {file && (
                <div className="between" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '14px 16px' }}>
                  <div className="row" style={{ gap: 12 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={20} /></span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{file.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{file.size} · PDF · téléversé à l'instant</div>
                    </div>
                  </div>
                  <div className="row" style={{ gap: 8 }}>
                    <span className="badge green"><Icon name="check" size={13} /> Joint</span>
                    <button className="iconbtn" style={{ width: 32, height: 32 }} title="Supprimer" onClick={() => setFile(null)}><Icon name="trash" size={15} /></button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 4 */}
          {step === 4 && (
            <div className="stack" style={{ gap: 18 }}>
              <div className="row" style={{ gap: 10, color: 'var(--green)' }}>
                <Icon name="check" size={20} /><span style={{ fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Vérifiez les informations avant la soumission finale</span>
              </div>
              <div className="card">
                <div className="card-head"><h3 className="card-title">{f.title || 'Activité sans titre'}</h3><StatusBadge status="Brouillon" /></div>
                <div className="card-body" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px 28px' }}>
                  {([
                    ['Département', DEPTS[f.dept].name],
                    ['Type', f.type],
                    ['Période', (f.start || '—') + '  →  ' + (f.end || '—')],
                    ['Lieu', f.venue || '—'],
                    ['Référence', f.ref || '—'],
                    ['Urgence', f.urgent ? 'Oui — hors cycle' : 'Non'],
                  ] as [string, string][]).map(([k, v]) => (
                    <div key={k}>
                      <div className="muted" style={{ fontSize: 11.5, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{k}</div>
                      <div style={{ fontWeight: 600, fontSize: 13.5, marginTop: 3 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid-2">
                <div className="card">
                  <div className="card-head"><h3 className="card-title">Participants ({participants.length})</h3>{conflicts > 0 && <span className="badge red">{conflicts} conflit{conflicts > 1 ? 's' : ''}</span>}</div>
                  <div style={{ padding: '6px 0' }}>
                    {participants.map((pp) => (
                      <div key={pp.id} className="between" style={{ padding: '8px 16px' }}>
                        <Person id={pp.id} conflict={pp.status === 'Conflit'} />
                        {pp.status === 'Conflit' ? <span className="badge red">Conflit</span> : <span className="badge green">Disponible</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card">
                  <div className="card-head"><h3 className="card-title">Document joint</h3></div>
                  <div className="card-body">
                    {file ? (
                      <div className="row" style={{ gap: 12 }}>
                        <span style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={20} /></span>
                        <div><div style={{ fontWeight: 700, fontSize: 13 }}>{file.name}</div><div className="muted" style={{ fontSize: 12 }}>{file.size} · PDF</div></div>
                      </div>
                    ) : (
                      <div className="muted">Aucun document joint.</div>
                    )}
                  </div>
                </div>
              </div>
              {conflicts > 0 && (
                <div className="row" style={{ gap: 10, border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 6, padding: '13px 16px', color: 'var(--amber)' }}>
                  <Icon name="alert" size={18} />
                  <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>{conflicts} participant(s) en conflit. L'activité sera soumise puis examinée par l'administrateur des conflits.</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Wizard footer */}
        <div className="between" style={{ padding: '16px 26px', borderTop: '1px solid var(--line)', background: 'var(--bg)', borderRadius: '0 0 8px 8px' }}>
          <button className="btn" onClick={() => (step === 1 ? setView('gate') : setStep((s) => s - 1))}>
            <Icon name="chevronLeft" size={16} /> {step === 1 ? 'Méthode' : 'Précédent'}
          </button>
          <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Étape {step} sur 4</span>
          {step < 4 ? (
            <button className="btn primary" disabled={!canNext} onClick={() => setStep((s) => s + 1)}>Continuer <Icon name="chevronRight" size={16} /></button>
          ) : (
            <button className="btn primary" onClick={() => navigate('/dashboard')}><Icon name="send" size={15} /> Soumettre l'activité</button>
          )}
        </div>
      </div>
    </div>
  )
}
