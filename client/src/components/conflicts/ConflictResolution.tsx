import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import Icon from '../ui/Icon'
import { useConflicts, useActivityConflicts, useResolveConflict } from '../../hooks/useConflicts'
import { useActivity } from '../../hooks/useActivities'
import { deptMeta, fmtRange, type ApiActivityConflict, type ApiConflictActivityEmbed } from '../../lib/api'

interface NormRow {
  id: string
  participantName: string
  main: ApiConflictActivityEmbed
  other: ApiConflictActivityEmbed
}

function ActivityCard({ a, label }: { a: ApiConflictActivityEmbed; label: string }) {
  const dm = deptMeta(a.department)
  return (
    <div className="card">
      <div style={{ height: 4, background: dm.color, borderRadius: '8px 8px 0 0' }} />
      <div className="card-body" style={{ paddingBottom: 12 }}>
        <div className="row" style={{ gap: 8, marginBottom: 8 }}>
          <span className="badge" style={{ color: dm.color, background: dm.bg, borderColor: dm.line }}>{dm.short}</span>
          <span className="muted" style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.04em' }}>{label}</span>
        </div>
        <div style={{ fontWeight: 700, fontSize: 14.5, lineHeight: 1.3 }}>{a.title}</div>
        <div className="stack" style={{ gap: 6, marginTop: 12 }}>
          <div className="row" style={{ gap: 8, color: 'var(--muted)', fontSize: 12.5 }}>
            <Icon name="calendar" size={15} /><span style={{ color: 'var(--ink-2)', fontWeight: 600 }}>{fmtRange(a.startDate, a.endDate)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ConflictResolution({ activityId }: { activityId?: string }) {
  const navigate = useNavigate()
  const scoped = !!activityId

  const global = useConflicts()
  const activityConflicts = useActivityConflicts(activityId)
  const activityDetail = useActivity(activityId)
  const resolveMut = useResolveConflict(activityId)

  const [openId, setOpenId] = useState<string | null>(null)
  const [mName, setMName] = useState('')
  const [mRole, setMRole] = useState('')

  const isLoading = scoped ? activityConflicts.isLoading : global.isLoading

  const mainEmbed: ApiConflictActivityEmbed | null = scoped && activityDetail.data
    ? { title: activityDetail.data.title, department: activityDetail.data.department, startDate: activityDetail.data.startDate, endDate: activityDetail.data.endDate }
    : null

  const rows: NormRow[] = scoped
    ? (activityConflicts.data ?? []).map((c: ApiActivityConflict) => ({
        id: c.id,
        participantName: c.participantName,
        main: mainEmbed ?? c.conflictingActivity,
        other: c.conflictingActivity,
      }))
    : (global.data?.data ?? []).map((c) => ({
        id: c.id,
        participantName: c.participantName,
        main: c.activity,
        other: c.conflictingActivity,
      }))

  function doResolve(conflictId: string, resolution: 'retire' | 'remplace' | 'ignore', replacementName?: string, replacementRole?: string) {
    resolveMut.mutate(
      { conflictId, input: { resolution, replacementName, replacementRole } },
      {
        onSuccess: () => {
          toast.success(resolution === 'remplace' ? 'Participant remplacé' : resolution === 'retire' ? 'Participant retiré' : 'Conflit ignoré')
          setOpenId(null)
          setMName('')
          setMRole('')
        },
        onError: (e) => toast.error((e as { response?: { data?: { error?: string } } }).response?.data?.error || 'Échec de la résolution'),
      },
    )
  }

  return (
    <div className="content">
      <div className="page-head">
        <div>
          {scoped && (
            <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 10 }}>
              <span className="crumb" onClick={() => navigate('/activities')}>Mes activités</span>
              <Icon name="chevronRight" size={13} />
              <span className="crumb" onClick={() => navigate(`/activities/${activityId}`)}>{activityDetail.data?.title || 'Activité'}</span>
              <Icon name="chevronRight" size={13} />
              <span style={{ color: 'var(--ink-2)' }}>Conflits</span>
            </div>
          )}
          <h1 className="page-title">Résolution des conflits</h1>
          <p className="page-desc">
            {rows.length > 0
              ? `${rows.length} conflit${rows.length > 1 ? 's' : ''} de ressources humaines à arbitrer`
              : 'Aucun conflit en attente — tout est arbitré.'}
          </p>
        </div>
        <button className="btn" onClick={() => navigate(scoped ? `/activities/${activityId}` : '/dashboard')}>
          <Icon name="chevronLeft" size={16} /> {scoped ? "Retour à l'activité" : 'Tableau de bord'}
        </button>
      </div>

      {isLoading && <div className="muted" style={{ padding: 40 }}>Chargement…</div>}

      {!isLoading && rows.length === 0 && (
        <div className="card">
          <div className="card-body" style={{ textAlign: 'center', padding: 48 }}>
            <div style={{ color: 'var(--green)', display: 'flex', justifyContent: 'center', marginBottom: 12 }}><Icon name="check" size={36} /></div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Aucun conflit en attente</div>
            <div className="muted" style={{ fontSize: 13, marginTop: 4 }}>Les conflits résolus n'apparaissent plus dans cette liste.</div>
          </div>
        </div>
      )}

      <div className="stack" style={{ gap: 20 }}>
        {rows.map((r) => {
          const open = openId === r.id
          return (
            <div className="card" key={r.id}>
              <div
                className="between"
                style={{ borderBottom: '1px solid var(--line)', background: 'var(--red-bg)', padding: '14px 18px', borderRadius: '8px 8px 0 0' }}
              >
                <div className="row" style={{ gap: 12 }}>
                  <span style={{ color: 'var(--red)' }}><Icon name="alert" size={20} /></span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 14 }}>{r.participantName}</div>
                    <div style={{ fontSize: 12.5, color: 'var(--ink-2)', marginTop: 1 }}>
                      Programmé(e) sur deux activités qui se chevauchent.
                    </div>
                  </div>
                </div>
                <span className="badge red"><span className="pip" />Conflit</span>
              </div>

              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, alignItems: 'start' }}>
                  <ActivityCard a={r.main} label="Cette activité" />
                  <ActivityCard a={r.other} label="Activité en conflit" />
                </div>

                {!open ? (
                  <div className="between" style={{ marginTop: 18, gap: 14, flexWrap: 'wrap' }}>
                    <div className="muted" style={{ fontSize: 12, lineHeight: 1.5, maxWidth: 460 }}>
                      <strong style={{ color: 'var(--ink-2)' }}>Remplacer</strong> substitue l'agent · <strong style={{ color: 'var(--ink-2)' }}>Retirer</strong> le libère · <strong style={{ color: 'var(--ink-2)' }}>Ignorer</strong> consigne le conflit.
                    </div>
                    <div className="row" style={{ gap: 10 }}>
                      <button className="btn primary" disabled={resolveMut.isPending} onClick={() => setOpenId(r.id)}>
                        <Icon name="swap" size={15} /> Remplacer
                      </button>
                      <button className="btn danger" disabled={resolveMut.isPending} onClick={() => doResolve(r.id, 'retire')}>
                        <Icon name="x" size={15} /> Retirer
                      </button>
                      <button className="btn" disabled={resolveMut.isPending} onClick={() => doResolve(r.id, 'ignore')}>
                        Ignorer
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ borderLeft: '3px solid var(--blue)', background: 'var(--blue-50)', borderRadius: '0 6px 6px 0', marginTop: 16, padding: '14px 16px' }}>
                    <div className="row" style={{ gap: 8, marginBottom: 12, color: 'var(--blue-700)', fontWeight: 700, fontSize: 13 }}>
                      <Icon name="swap" size={15} /> Remplacer {r.participantName}
                    </div>
                    <div className="grid-2" style={{ gap: 14 }}>
                      <div className="field">
                        <label>Nom complet du remplaçant</label>
                        <input className="input" placeholder="ex. Dr ADJO Yawo" value={mName} onChange={(e) => setMName(e.target.value)} autoFocus />
                      </div>
                      <div className="field">
                        <label>Titre / Rôle</label>
                        <input className="input" placeholder="ex. Biologiste · INH" value={mRole} onChange={(e) => setMRole(e.target.value)} />
                      </div>
                    </div>
                    <div className="row" style={{ gap: 10, marginTop: 6 }}>
                      <button
                        className="btn primary"
                        disabled={!mName.trim() || resolveMut.isPending}
                        onClick={() => doResolve(r.id, 'remplace', mName.trim(), mRole.trim())}
                      >
                        <Icon name="check" size={15} /> Confirmer le remplacement
                      </button>
                      <button className="btn" onClick={() => { setOpenId(null); setMName(''); setMRole('') }}>Annuler</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
