import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { StatusBadge, DetailPerson } from '../../components/ui/common'
import { DETAIL, DET_PARTICIPANTS, DET_FACILITATORS } from '../../lib/mock'

function KV({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className="between" style={{ padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--line)', gap: 16 }}>
      <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{children}</span>
    </div>
  )
}

export default function ActivityDetailPage() {
  const navigate = useNavigate()
  const { id = 'A1' } = useParams()
  const d = DETAIL
  const conflicts = DET_PARTICIPANTS.filter((p) => p.status === 'Conflit').length
  const [addFac, setAddFac] = useState(true)
  const [facName, setFacName] = useState('')
  const [facRole, setFacRole] = useState('')

  const sortedParticipants = [...DET_PARTICIPANTS].sort(
    (a, b) => (a.status === 'Conflit' ? 0 : 1) - (b.status === 'Conflit' ? 0 : 1),
  )

  return (
    <div className="content">
      {/* Breadcrumb */}
      <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>
        <span style={{ cursor: 'pointer' }} onClick={() => navigate('/activities')} className="crumb">Mes activités</span>
        <Icon name="chevronRight" size={13} />
        <span style={{ color: 'var(--ink-2)', maxWidth: 520, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.title}</span>
      </div>

      {/* Header */}
      <div className="between" style={{ alignItems: 'flex-start', gap: 20, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title" style={{ fontSize: 24, lineHeight: 1.22, maxWidth: 760 }}>{d.title}</h1>
          <div className="row" style={{ gap: 0, flexWrap: 'wrap', marginTop: 12, rowGap: 8 }}>
            <span className="meta-chip mono">{d.ref}</span>
            <span className="meta-sep" />
            <span className="meta-chip"><Icon name="calendar" size={14} />{d.rangeShort}</span>
            <span className="meta-sep" />
            <span className="meta-chip"><Icon name="mapPin" size={14} />{d.venue}</span>
            <span className="meta-sep" />
            {conflicts > 0 && (
              <span className="badge red" style={{ marginRight: 10 }}>
                <span className="pip" />{conflicts} conflits
              </span>
            )}
            <StatusBadge status={d.status} />
          </div>
        </div>
        <div className="row" style={{ gap: 10, flex: 'none' }}>
          <button className="btn"><Icon name="download" size={16} /> Exporter</button>
          <button className="btn" onClick={() => navigate(`/activities/${id}/edit`)}><Icon name="edit" size={15} /> Modifier</button>
        </div>
      </div>

      {/* Conflict alert banner */}
      {conflicts > 0 && (
        <div className="between" style={{ border: '1px solid var(--red-line)', background: 'var(--red-bg)', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
          <div className="row" style={{ gap: 11 }}>
            <span style={{ color: 'var(--red)' }}><Icon name="alert" size={20} /></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>{conflicts} participants en conflit de planification</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>Certains agents sont programmés sur des activités qui se chevauchent. Arbitrez ces conflits avant le démarrage de l'atelier.</div>
            </div>
          </div>
          <button className="btn primary" style={{ flex: 'none' }} onClick={() => navigate(`/activities/${id}/conflicts`)}>
            Gérer les conflits <Icon name="arrowRight" size={15} />
          </button>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* LEFT COLUMN */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head"><h2 className="card-title">Informations générales</h2></div>
            <div className="card-body" style={{ paddingTop: 4, paddingBottom: 6 }}>
              <KV label="Type d'activité">
                <span className="badge" style={{ color: d.deptColor, background: d.deptBg, borderColor: d.deptLine }}>{d.type}</span>
              </KV>
              <KV label="Département organisateur">{d.deptName}</KV>
              <KV label="Référence du document"><span className="mono">{d.ref}</span></KV>
              <KV label="Date de début">{d.start}</KV>
              <KV label="Date de fin">{d.end}</KV>
              <KV label="Durée">{d.duration}</KV>
              <KV label="Lieu">{d.venue}</KV>
              <KV label="Soumis par">{d.submitter}</KV>
              <KV label="Date de soumission" last>{d.submittedOn}</KV>
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
                <a className="link" style={{ flex: 'none' }}><Icon name="download" size={14} /> Télécharger</a>
              </div>
              <button className="btn" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }}><Icon name="plus" size={15} /> Ajouter un document</button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Participants ({d.totalParticipants})</h2>
              {conflicts > 0 && <span className="badge red"><span className="pip" />{conflicts} conflits</span>}
            </div>
            <div style={{ maxHeight: 520, overflowY: 'auto', padding: '2px 18px 0' }}>
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
            <div className="card-body" style={{ paddingTop: 2, paddingBottom: addFac ? 0 : 14 }}>
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
                  <div className="field">
                    <label>Nom complet</label>
                    <input className="input" placeholder="ex. Dr ADANSI Komla" value={facName} onChange={(e) => setFacName(e.target.value)} />
                  </div>
                  <div className="field">
                    <label>Titre / Rôle</label>
                    <input className="input" placeholder="ex. Épidémiologiste, GIZ" value={facRole} onChange={(e) => setFacRole(e.target.value)} />
                  </div>
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
    </div>
  )
}
