import { useState, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../components/ui/Icon'
import { StatusBadge, DetailPerson } from '../../components/ui/common'
import api from '../../lib/axios'
import { useActivity, useAddParticipant } from '../../hooks/useActivities'
import { deptMeta, STATUS_LABEL, TYPE_LABEL, fmtDate, fmtRange, fmtDateTime, type ApiParticipant, type ApiActivityConflict } from '../../lib/api'
import type { PersonRow } from '../../lib/mock'

function KV({ label, children, last }: { label: string; children: ReactNode; last?: boolean }) {
  return (
    <div className="between" style={{ padding: '11px 0', borderBottom: last ? 'none' : '1px solid var(--line)', gap: 16 }}>
      <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>{label}</span>
      <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ink)', textAlign: 'right' }}>{children}</span>
    </div>
  )
}

const AVAIL: Record<ApiParticipant['availabilityStatus'], PersonRow['status']> = {
  disponible: 'Disponible',
  conflit: 'Conflit',
  nouveau: 'Nouveau',
}

function duration(start: string, end: string) {
  const days = Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
  return (days > 0 ? days : 1) + ' jour' + (days > 1 ? 's' : '')
}

export default function ActivityDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: d, isLoading, isError } = useActivity(id)
  const addFacMut = useAddParticipant(id || '')

  const [addFac, setAddFac] = useState(false)
  const [facName, setFacName] = useState('')
  const [facRole, setFacRole] = useState('')

  if (isLoading) return <div className="content"><div className="muted" style={{ padding: 40 }}>Chargement…</div></div>
  if (isError || !d) return <div className="content"><div className="muted" style={{ padding: 40 }}>Activité introuvable.</div></div>

  const dm = deptMeta(d.department)
  const participants = d.participants.filter((p) => p.participantType === 'participant')
  const facilitators = d.participants.filter((p) => p.participantType === 'facilitateur')
  const conflicts = d.conflictsAsMain.length

  // Map conflict notes by participant name
  const noteFor = (name: string) => {
    const c: ApiActivityConflict | undefined = d.conflictsAsMain.find((x) => x.participantName === name)
    if (!c) return undefined
    return `${c.conflictingActivity.title}, ${fmtRange(c.conflictingActivity.startDate, c.conflictingActivity.endDate)}`
  }

  const toRow = (p: ApiParticipant): PersonRow => ({
    name: p.fullName,
    role: p.titleRole,
    status: AVAIL[p.availabilityStatus],
    note: p.availabilityStatus === 'conflit' ? noteFor(p.fullName) : undefined,
  })

  const sortedParticipants = [...participants].sort(
    (a, b) => (a.availabilityStatus === 'conflit' ? 0 : 1) - (b.availabilityStatus === 'conflit' ? 0 : 1),
  )

  const doc = d.documents[0]

  async function download(kind: 'pdf' | 'excel') {
    const tid = toast.loading('Génération du document…')
    try {
      const res = await api.get(`/activities/${id}/export/${kind}`, { responseType: 'blob' })
      const url = URL.createObjectURL(res.data as Blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `activite-${id}.${kind === 'pdf' ? 'pdf' : 'xlsx'}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success(`Document ${kind === 'pdf' ? 'PDF' : 'Excel'} téléchargé`, { id: tid })
    } catch {
      toast.error("Échec de l'export", { id: tid })
    }
  }

  function submitFac() {
    if (!facName.trim()) return
    addFacMut.mutate(
      { fullName: facName.trim(), titleRole: facRole.trim(), participantType: 'facilitateur' },
      { onSuccess: () => { setAddFac(false); setFacName(''); setFacRole('') } },
    )
  }

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
            <span className="meta-chip mono">{d.referenceNumber || '—'}</span>
            <span className="meta-sep" />
            <span className="meta-chip"><Icon name="calendar" size={14} />{fmtRange(d.startDate, d.endDate)}</span>
            <span className="meta-sep" />
            <span className="meta-chip"><Icon name="mapPin" size={14} />{d.venue}</span>
            <span className="meta-sep" />
            {conflicts > 0 && (
              <span className="badge red" style={{ marginRight: 10 }}>
                <span className="pip" />{conflicts} conflit{conflicts > 1 ? 's' : ''}
              </span>
            )}
            <StatusBadge status={STATUS_LABEL[d.status]} />
          </div>
        </div>
        <div className="row" style={{ gap: 10, flex: 'none' }}>
          <button className="btn" onClick={() => download('pdf')}><Icon name="download" size={16} /> Exporter</button>
          <button className="btn" onClick={() => navigate(`/activities/${id}/edit`)}><Icon name="edit" size={15} /> Modifier</button>
        </div>
      </div>

      {/* Conflict alert banner */}
      {conflicts > 0 && (
        <div className="between" style={{ border: '1px solid var(--red-line)', background: 'var(--red-bg)', borderRadius: 8, padding: '14px 18px', marginBottom: 20 }}>
          <div className="row" style={{ gap: 11 }}>
            <span style={{ color: 'var(--red)' }}><Icon name="alert" size={20} /></span>
            <div>
              <div style={{ fontWeight: 800, fontSize: 13.5 }}>{conflicts} participant{conflicts > 1 ? 's' : ''} en conflit de planification</div>
              <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>Certains agents sont programmés sur des activités qui se chevauchent. Arbitrez ces conflits avant le démarrage de l'activité.</div>
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
                <span className="badge" style={{ color: dm.color, background: dm.bg, borderColor: dm.line }}>{TYPE_LABEL[d.type]}</span>
              </KV>
              <KV label="Département organisateur">{dm.name || d.department}</KV>
              <KV label="Référence du document"><span className="mono">{d.referenceNumber || '—'}</span></KV>
              <KV label="Date de début">{fmtDate(d.startDate)}</KV>
              <KV label="Date de fin">{fmtDate(d.endDate)}</KV>
              <KV label="Durée">{duration(d.startDate, d.endDate)}</KV>
              <KV label="Lieu">{d.venue}</KV>
              <KV label="Soumis par">{d.submittedBy?.fullName || '—'}</KV>
              <KV label="Date de soumission" last>{fmtDateTime(d.submittedAt)}</KV>
            </div>
          </div>

          <div className="card">
            <div className="card-head"><h2 className="card-title">Document TDR</h2></div>
            <div className="card-body" style={{ paddingTop: 14 }}>
              {doc ? (
                <div className="between" style={{ border: '1px solid var(--line)', borderRadius: 6, padding: '12px 14px' }}>
                  <div className="row" style={{ gap: 12, minWidth: 0 }}>
                    <span style={{ width: 40, height: 40, borderRadius: 6, flex: 'none', background: 'var(--red-bg)', color: 'var(--red)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="file" size={20} /></span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.filename}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{Math.round(doc.fileSizeBytes / 1024)} Ko · {doc.mimeType.includes('pdf') ? 'PDF' : 'Word'}</div>
                    </div>
                  </div>
                  {doc.downloadUrl && <a className="link" href={doc.downloadUrl} target="_blank" rel="noreferrer" style={{ flex: 'none' }}><Icon name="download" size={14} /> Télécharger</a>}
                </div>
              ) : (
                <div className="muted" style={{ fontSize: 13 }}>Aucun document joint.</div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Participants ({participants.length})</h2>
              {conflicts > 0 && <span className="badge red"><span className="pip" />{conflicts} conflit{conflicts > 1 ? 's' : ''}</span>}
            </div>
            <div style={{ maxHeight: 520, overflowY: 'auto', padding: '2px 18px 0' }}>
              {sortedParticipants.length === 0 && <div className="muted" style={{ padding: '14px 0', fontSize: 13 }}>Aucun participant.</div>}
              {sortedParticipants.map((p, i) => (
                <div key={p.id} style={{ borderBottom: i < sortedParticipants.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <DetailPerson p={toRow(p)} />
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
            <div className="card-head"><h2 className="card-title">Facilitateurs / Intervenants ({facilitators.length})</h2></div>
            <div className="card-body" style={{ paddingTop: 2, paddingBottom: addFac ? 0 : 14 }}>
              {facilitators.map((p, i) => (
                <div key={p.id} style={{ borderBottom: i < facilitators.length - 1 ? '1px solid var(--line)' : 'none' }}>
                  <DetailPerson p={toRow(p)} badge={false} />
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
                    <button className="btn primary" style={{ flex: 1, justifyContent: 'center' }} disabled={!facName.trim() || addFacMut.isPending} onClick={submitFac}><Icon name="check" size={15} /> Ajouter</button>
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
