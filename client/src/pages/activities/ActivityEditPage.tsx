import { useState, useEffect, type ReactNode } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../../components/ui/Icon'
import { DetailPerson } from '../../components/ui/common'
import { DEPTS, type PersonRow } from '../../lib/mock'
import { useActivity, useUpdateActivity, useAddParticipant } from '../../hooks/useActivities'
import { TYPE_LABEL, fmtDateTime, type ApiActivityType, type ApiParticipant } from '../../lib/api'

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

const TYPES: ApiActivityType[] = ['atelier', 'formation', 'mission', 'reunion', 'autre']
const AVAIL: Record<ApiParticipant['availabilityStatus'], PersonRow['status']> = { disponible: 'Disponible', conflit: 'Conflit', nouveau: 'Nouveau' }

export default function ActivityEditPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { data: activity, isLoading } = useActivity(id)
  const updateMut = useUpdateActivity(id || '')
  const addFacMut = useAddParticipant(id || '')

  const [form, setForm] = useState({ type: 'atelier' as ApiActivityType, dept: 'INH', ref: '', start: '', end: '', venue: '' })
  const [dirty, setDirty] = useState(false)
  const [addFac, setAddFac] = useState(false)
  const [facName, setFacName] = useState('')
  const [facRole, setFacRole] = useState('')

  useEffect(() => {
    if (!activity) return
    setForm({
      type: activity.type,
      dept: activity.department,
      ref: activity.referenceNumber || '',
      start: activity.startDate,
      end: activity.endDate,
      venue: activity.venue,
    })
    setDirty(false)
  }, [activity])

  const set = (k: string, v: string) => { setForm((p) => ({ ...p, [k]: v })); setDirty(true) }
  const detail = () => navigate(`/activities/${id}`)

  const duration = (() => {
    if (!form.start || !form.end) return '—'
    const days = Math.round((new Date(form.end).getTime() - new Date(form.start).getTime()) / 86400000) + 1
    return (days > 0 ? days : 1) + ' jour' + (days > 1 ? 's' : '')
  })()

  function save() {
    updateMut.mutate(
      {
        type: form.type,
        department: form.dept,
        referenceNumber: form.ref || undefined,
        startDate: form.start,
        endDate: form.end,
        venue: form.venue,
      },
      {
        onSuccess: () => { toast.success('Activité mise à jour'); setDirty(false); detail() },
        onError: (e) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Échec de la mise à jour'),
      },
    )
  }

  function submitFac() {
    if (!facName.trim()) return
    addFacMut.mutate(
      { fullName: facName.trim(), titleRole: facRole.trim(), participantType: 'facilitateur' },
      { onSuccess: () => { setAddFac(false); setFacName(''); setFacRole('') } },
    )
  }

  if (isLoading || !activity) return <div className="content"><div className="muted" style={{ padding: 40 }}>Chargement…</div></div>

  const participants = activity.participants.filter((p) => p.participantType === 'participant')
  const facilitators = activity.participants.filter((p) => p.participantType === 'facilitateur')
  const conflicts = activity.conflictsAsMain.length
  const toRow = (p: ApiParticipant): PersonRow => ({ name: p.fullName, role: p.titleRole, status: AVAIL[p.availabilityStatus] })
  const sortedParticipants = [...participants].sort((a, b) => (a.availabilityStatus === 'conflit' ? 0 : 1) - (b.availabilityStatus === 'conflit' ? 0 : 1))

  return (
    <div className="content" style={{ paddingBottom: 96 }}>
      {/* Breadcrumb */}
      <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14, flexWrap: 'wrap', rowGap: 4 }}>
        <span className="crumb" onClick={() => navigate('/activities')}>Mes activités</span>
        <Icon name="chevronRight" size={13} />
        <span className="crumb" onClick={detail} style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{activity.title}</span>
        <Icon name="chevronRight" size={13} />
        <span style={{ color: 'var(--ink-2)' }}>Modifier</span>
      </div>

      {/* Header */}
      <div className="between" style={{ alignItems: 'flex-start', gap: 20, marginBottom: 16 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">Modifier l'activité</h1>
          <p className="page-desc" style={{ marginTop: 6 }}>
            {activity.title} · <span className="mono">{activity.referenceNumber || '—'}</span>
          </p>
        </div>
        <button className="btn" style={{ flex: 'none' }} onClick={detail}>Annuler</button>
      </div>

      {dirty && (
        <div className="row" style={{ gap: 10, border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, color: 'var(--amber)' }}>
          <Icon name="alert" size={17} />
          <span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Vous avez des modifications non enregistrées. N'oubliez pas d'enregistrer avant de quitter.</span>
        </div>
      )}

      <div className="grid-2" style={{ alignItems: 'start', gap: 20 }}>
        {/* LEFT */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head"><h2 className="card-title">Informations générales</h2></div>
            <div className="card-body">
              <EAField label="Type d'activité">
                <select className="input in-amber" value={form.type} onChange={(e) => set('type', e.target.value)}>
                  {TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}
                </select>
              </EAField>
              <EAField label="Département organisateur">
                <select className="input in-amber" value={form.dept} onChange={(e) => set('dept', e.target.value)}>
                  {Object.values(DEPTS).map((dd) => <option key={dd.id} value={dd.id}>{dd.name}</option>)}
                </select>
              </EAField>
              <EAField label="Référence du document">
                <input className="input in-amber mono" value={form.ref} onChange={(e) => set('ref', e.target.value)} />
              </EAField>
              <div className="grid-2" style={{ gap: 14 }}>
                <EAField label="Date de début">
                  <input className="input in-amber" type="date" value={form.start} onChange={(e) => set('start', e.target.value)} />
                </EAField>
                <EAField label="Date de fin">
                  <input className="input in-amber" type="date" value={form.end} onChange={(e) => set('end', e.target.value)} />
                </EAField>
              </div>
              <EAField label="Lieu">
                <input className="input in-amber" value={form.venue} onChange={(e) => set('venue', e.target.value)} />
              </EAField>

              <div style={{ marginTop: 8 }}>
                <EAReadonly label="Durée" value={duration + ' (calculé automatiquement)'} />
                <EAReadonly label="Soumis par" value={activity.submittedBy?.fullName || '—'} />
                <div className="between" style={{ padding: '11px 0', gap: 16 }}>
                  <span className="row" style={{ gap: 6, color: 'var(--muted)', fontSize: 12.5, fontWeight: 600 }}><Icon name="lock" size={13} /> Date de soumission</span>
                  <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--muted)' }}>{fmtDateTime(activity.submittedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="stack" style={{ gap: 20 }}>
          <div className="card">
            <div className="card-head">
              <h2 className="card-title">Participants ({participants.length}){conflicts > 0 ? ' · ' + conflicts + ' conflits' : ''}</h2>
              {conflicts > 0 && <span className="badge red"><span className="pip" />{conflicts} conflits</span>}
            </div>
            <div style={{ padding: '12px 18px 0' }}>
              <div className="muted" style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Pour modifier les participants, utilisez « Gérer les participants ».</div>
            </div>
            <div style={{ maxHeight: 420, overflowY: 'auto', padding: '0 18px' }}>
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
            <div className="card-body" style={{ paddingTop: 12, paddingBottom: addFac ? 0 : 14 }}>
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
                  <div className="field"><label>Nom complet</label><input className="input" placeholder="ex. Dr ADANSI Komla" value={facName} onChange={(e) => setFacName(e.target.value)} /></div>
                  <div className="field"><label>Titre / Rôle</label><input className="input" placeholder="ex. Épidémiologiste, GIZ" value={facRole} onChange={(e) => setFacRole(e.target.value)} /></div>
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

      {/* Sticky save footer */}
      <div className="edit-footer">
        <span className="muted" style={{ fontSize: 12, fontWeight: 600 }}>{dirty ? 'Modifications non enregistrées' : 'Aucune modification'}</span>
        <div className="row" style={{ gap: 10 }}>
          <button className="btn" onClick={detail}>Annuler</button>
          <button className="btn primary" disabled={!dirty || updateMut.isPending} onClick={save}><Icon name="check" size={16} /> {updateMut.isPending ? 'Enregistrement…' : 'Enregistrer les modifications'}</button>
        </div>
      </div>
    </div>
  )
}
