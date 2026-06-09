import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { DetailPerson } from '../../components/ui/common'
import { DEPTS, DET_PARTICIPANTS, DET_FACILITATORS } from '../../lib/mock'

function EAField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return (
    <div className="field" style={{ marginBottom: 16 }}>
      <label>{label}</label>
      {children}
      {hint && <span className="hint">{hint}</span>}
    </div>
  )
}

function EAReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="between" style={{ padding: '11px 0', borderBottom: '1px solid var(--line)', gap: 16 }}>
      <span className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12.5, fontWeight: 600 }}>
        <Icon name="lock" size={13} /> {label}
      </span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)', textAlign: 'right' }}>{value}</span>
    </div>
  )
}

export default function ActivityEditPage() {
  const navigate = useNavigate()
  const { id = 'A1' } = useParams()

  const [addFac, setAddFac] = useState(false)
  const [facName, setFacName] = useState('')
  const [facRole, setFacRole] = useState('')

  const [start, setStart] = useState('2026-06-02')
  const [end, setEnd] = useState('2026-06-07')
  const [type, setType] = useState('Atelier')
  const [dept, setDept] = useState('INH')
  const [ref, setRef] = useState('INH/2026/041')
  const [venue, setVenue] = useState('Hôtel MORIJA, Tsévié — Zio')

  const duration = (() => {
    const a = new Date(start)
    const b = new Date(end)
    const days = Math.round((b.getTime() - a.getTime()) / 86400000) + 1
    return (days > 0 ? days : 1) + ' jour' + (days > 1 ? 's' : '')
  })()

  const conflicts = DET_PARTICIPANTS.filter((p) => p.status === 'Conflit').length
  const sortedParticipants = [...DET_PARTICIPANTS].sort((a, b) => (a.status === 'Conflit' ? 0 : 1) - (b.status === 'Conflit' ? 0 : 1))

  const detail = () => navigate(`/activities/${id}`)

  return (
    <div className="content" style={{ paddingBottom: 96 }}>
      {/* Breadcrumb */}
      <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14, flexWrap: 'wrap', rowGap: 4 }}>
        <span className="crumb" onClick={() => navigate('/activities')}>Mes activités</span>
        <Icon name="chevronRight" size={13} />
        <span className="crumb" onClick={detail} style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Atelier de rédaction…</span>
        <Icon name="chevronRight" size={13} />
        <span style={{ color: 'var(--ink-2)' }}>Modifier</span>
      </div>

      {/* Header */}
      <div className="between" style={{ alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">Modifier l'activité</h1>
          <p className="page-desc" style={{ marginTop: 6 }}>
            Atelier de rédaction et d'élaboration de drafts de manuscrits scientifiques · <span className="mono">INH/2026/041</span>
          </p>
        </div>
        <button className="btn" style={{ flex: 'none' }} onClick={detail}>Annuler</button>
      </div>

      <div className="row" style={{ gap: 10, border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: 'var(--amber)' }}>
        <Icon name="alert" size={17} />
        <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Vous avez des modifications non enregistrées. N'oubliez pas d'enregistrer avant de quitter.</span>
      </div>

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* LEFT */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head"><h2 className="card-title">Informations générales</h2></div>
            <div className="card-body">
              <EAField label="Type d'activité">
                <select className="input in-amber" value={type} onChange={(e) => setType(e.target.value)}>
                  {['Atelier', 'Formation', 'Mission', 'Réunion', 'Autre'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </EAField>
              <EAField label="Département organisateur">
                <select className="input in-amber" value={dept} onChange={(e) => setDept(e.target.value)}>
                  {Object.values(DEPTS).map((dd) => <option key={dd.id} value={dd.id}>{dd.name}</option>)}
                </select>
              </EAField>
              <EAField label="Référence du document">
                <input className="input in-amber mono" value={ref} onChange={(e) => setRef(e.target.value)} />
              </EAField>
              <div className="grid-2" style={{ gap: 14 }}>
                <EAField label="Date de début">
                  <input className="input in-amber" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
                </EAField>
                <EAField label="Date de fin">
                  <input className="input in-amber" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
                </EAField>
              </div>
              <EAField label="Lieu">
                <input className="input in-amber" value={venue} onChange={(e) => setVenue(e.target.value)} />
              </EAField>

              <div style={{ marginTop: 8 }}>
                <EAReadonly label="Durée" value={duration + ' (calculé automatiquement)'} />
                <EAReadonly label="Soumis par" value="Dr HALATOKO Wemboo Afiwa" />
                <div className="between" style={{ padding: '11px 0', gap: 16 }}>
                  <span className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12.5, fontWeight: 600 }}><Icon name="lock" size={13} /> Date de soumission</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)' }}>20 mai 2026</span>
                </div>
              </div>
              <div className="muted" style={{ fontSize: 11.5, lineHeight: 1.45, marginTop: 6, paddingTop: 10, borderTop: '1px solid var(--line)' }}>
                Ces champs sont calculés automatiquement ou ne peuvent pas être modifiés.
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2 className="card-title">Document TDR</h2></div>
            <div className="card-body" style={{ paddingTop: 14 }}>
              <div className="between" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '12px 14px' }}>
                <div className="row" style={{ gap: 12, minWidth: 0 }}>
                  <span style={{ width: 40, height: 40, borderRadius: 6, flex: 'none', background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={20} /></span>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>TDR_atelier_manuscrits_scientifiques.pdf</div>
                    <div className="muted" style={{ fontSize: 12 }}>320 Ko · PDF</div>
                  </div>
                </div>
                <div className="row" style={{ gap: 12, flex: 'none' }}>
                  <a className="link"><Icon name="refresh" size={13} /> Remplacer</a>
                  <a className="link"><Icon name="download" size={14} /> Télécharger</a>
                </div>
              </div>
              <button className="btn" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}><Icon name="plus" size={15} /> Ajouter un document</button>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Participants ({DET_PARTICIPANTS.length}){conflicts > 0 ? ' · ' + conflicts + ' conflits' : ''}</h2>
              {conflicts > 0 && <span className="badge red"><span className="pip" />{conflicts} conflits</span>}
            </div>
            <div style={{ padding: '12px 18px 0' }}>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pour modifier les participants, utilisez « Gérer les participants ».</div>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0 18px' }}>
              {sortedParticipants.map((p, i) => (
                <div key={i} style={{ borderBottom: i < sortedParticipants.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <DetailPerson p={p} />
                </div>
              ))}
            </div>
            <div className="row" style={{ gap: 10, padding: '14px 18px', borderTop: '1px solid var(--line)' }}>
              <button className="btn sm" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/activities/${id}/participants`)}><Icon name="users" size={15} /> Gérer les participants</button>
              {conflicts > 0 && (
                <button className="btn sm danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => navigate(`/activities/${id}/conflicts`)}><Icon name="alert" size={15} /> Gérer les conflits</button>
              )}
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2 className="card-title">Facilitateurs / Intervenants ({DET_FACILITATORS.length})</h2></div>
            <div className="card-body" style={{ paddingTop: 12, paddingBottom: addFac ? 0 : 14 }}>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Pour modifier les facilitateurs, utilisez le bouton ci-dessous.</div>
              {DET_FACILITATORS.map((p, i) => (
                <div key={i} style={{ borderBottom: i < DET_FACILITATORS.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <DetailPerson p={p} badge={false} />
                </div>
              ))}
              {!addFac && (
                <button className="btn" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} onClick={() => setAddFac(true)}><Icon name="plus" size={15} /> Ajouter un facilitateur</button>
              )}
            </div>
            {addFac && (
              <div style={{ borderTop: '2px solid var(--blue)', background: 'var(--blue-50)', padding: '16px 18px', borderRadius: '0 0 8px 8px' }}>
                <div className="row" style={{ gap: 8, marginBottom: 14, color: 'var(--blue-700)', fontWeight: 700, fontSize: 13 }}>
                  <Icon name="plus" size={15} /> Nouveau facilitateur
                </div>
                <div className="stack" style={{ gap: 12 }}>
                  <div className="field"><label>Nom complet</label><input className="input" placeholder="ex. Dr ADANSI Komla" value={facName} onChange={(e) => setFacName(e.target.value)} /></div>
                  <div className="field"><label>Titre / Rôle</label><input className="input" placeholder="ex. Épidémiologiste, GIZ" value={facRole} onChange={(e) => setFacRole(e.target.value)} /></div>
                  <div className="row" style={{ gap: 10, marginTop: 2 }}>
                    <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setAddFac(false); setFacName(''); setFacRole('') }}>Annuler</button>
                    <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!facName.trim()} onClick={() => { setAddFac(false); setFacName(''); setFacRole('') }}><Icon name="check" size={15} /> Ajouter</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sticky save footer */}
      <div className="edit-footer">
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>Dernière modification : aujourd'hui</span>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={detail}>Annuler</button>
          <button className="btn primary" onClick={detail}><Icon name="check" size={16} /> Enregistrer les modifications</button>
        </div>
      </div>
    </div>
  )
}
