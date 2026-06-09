import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from '../../components/ui/Icon'
import { DET_PARTICIPANTS, initials } from '../../lib/mock'

interface Row {
  id: number
  name: string
  role: string
  status?: string
}

export default function ManageParticipantsPage() {
  const navigate = useNavigate()
  const { id = 'A1' } = useParams()

  const seed: Row[] = DET_PARTICIPANTS.map((p, i) => ({ id: i, name: p.name, role: p.role, status: p.status }))
  const editSeedIdx = Math.max(0, seed.findIndex((p) => /ASSIH/.test(p.name)))
  const [rows, setRows] = useState<Row[]>(seed)
  const [editId, setEditId] = useState<number | null>(editSeedIdx)
  const [draft, setDraft] = useState({ name: seed[editSeedIdx]?.name || '', role: seed[editSeedIdx]?.role || '' })
  const [nName, setNName] = useState('')
  const [nRole, setNRole] = useState('')

  const total = rows.length
  const conflictCount = rows.filter((r) => r.status === 'Conflit').length
  const availCount = rows.filter((r) => r.status !== 'Conflit').length

  function startEdit(r: Row) {
    setEditId(r.id)
    setDraft({ name: r.name, role: r.role })
  }
  function saveEdit() {
    setRows((rs) => rs.map((r) => (r.id === editId ? { ...r, name: draft.name, role: draft.role } : r)))
    setEditId(null)
  }
  function cancelEdit() {
    setEditId(null)
  }
  function removeRow(rid: number) {
    setRows((rs) => rs.filter((r) => r.id !== rid))
    if (editId === rid) setEditId(null)
  }
  function addRow() {
    if (!nName.trim()) return
    setRows((rs) => [...rs, { id: Date.now(), name: nName.trim(), role: nRole.trim() || '—', status: 'Disponible' }])
    setNName('')
    setNRole('')
  }

  return (
    <div className="content">
      {/* Breadcrumb */}
      <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14, flexWrap: 'wrap', rowGap: 4 }}>
        <span className="crumb" onClick={() => navigate('/activities')}>Mes activités</span>
        <Icon name="chevronRight" size={13} />
        <span className="crumb" onClick={() => navigate(`/activities/${id}`)} style={{ maxWidth: 340, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Atelier de rédaction…</span>
        <Icon name="chevronRight" size={13} />
        <span style={{ color: 'var(--ink-2)' }}>Gérer les participants</span>
      </div>

      {/* Header */}
      <div className="between" style={{ alignItems: 'flex-start', gap: 20, marginBottom: 18 }}>
        <div style={{ minWidth: 0 }}>
          <h1 className="page-title">Gérer les participants</h1>
          <p className="page-desc" style={{ marginTop: 6 }}>
            Atelier de rédaction et d'élaboration de drafts de manuscrits scientifiques · <span className="mono">INH/2026/041</span>
          </p>
        </div>
        <button className="btn" style={{ flex: 'none' }} onClick={() => navigate(`/activities/${id}`)}><Icon name="chevronLeft" size={16} /> Retour à l'activité</button>
      </div>

      {/* Summary bar */}
      <div className="between" style={{ border: '1px solid var(--line)', background: 'var(--card)', borderRadius: 8, padding: '14px 18px', marginBottom: 20, flexWrap: 'wrap', gap: 14 }}>
        <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
          <span className="mp-metric">
            <span className="mp-ico" style={{ background: 'var(--blue-50)', color: 'var(--blue-700)' }}><Icon name="users" size={16} /></span>
            <span className="mp-val">{total}</span><span className="mp-lab">Total participants</span>
          </span>
          <span className="mp-metric">
            <span className="mp-ico" style={{ background: 'var(--red-bg)', color: 'var(--red)' }}><Icon name="alert" size={16} /></span>
            <span className="mp-val" style={{ color: 'var(--red)' }}>{conflictCount}</span><span className="mp-lab">En conflit</span>
          </span>
          <span className="mp-metric">
            <span className="mp-ico" style={{ background: 'var(--green-bg)', color: 'var(--green)' }}><Icon name="check" size={16} /></span>
            <span className="mp-val" style={{ color: 'var(--green)' }}>{availCount}</span><span className="mp-lab">Disponibles</span>
          </span>
        </div>
        <span className="muted" style={{ fontSize: 12, fontWeight: 500, maxWidth: 320, textAlign: 'right' }}>
          Les conflits sont gérés séparément via la page « Gérer les conflits ».
        </span>
      </div>

      {/* Participant table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        <table className="tbl mp-tbl">
          <thead>
            <tr>
              <th style={{ width: 46 }}>#</th>
              <th>Participant</th>
              <th>Titre / Rôle</th>
              <th style={{ width: 140 }}>Statut</th>
              <th style={{ width: 110, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const editing = editId === r.id
              const conflict = r.status === 'Conflit'
              return (
                <tr key={r.id} style={{ background: editing ? 'var(--blue-50)' : i % 2 ? '#FAFBFC' : 'var(--card)' }}>
                  <td className="muted" style={{ fontWeight: 700 }}>{String(i + 1).padStart(2, '0')}</td>
                  <td>
                    {editing ? (
                      <div className="row" style={{ gap: 10 }}>
                        <div className="pa" style={{ width: 30, height: 30, flex: 'none', borderRadius: '50%', background: 'var(--slate-bg)', color: 'var(--slate)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 11.5 }}>{(initials(draft.name) || 'N').toUpperCase()}</div>
                        <input className="input" style={{ height: 34 }} value={draft.name} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} placeholder="Nom complet" />
                      </div>
                    ) : (
                      <div className="person">
                        <div className="pa" style={conflict ? { background: 'var(--red-bg)', color: 'var(--red)' } : undefined}>{(initials(r.name) || 'N').toUpperCase()}</div>
                        <div className="pn">{r.name}</div>
                      </div>
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <input className="input" style={{ height: 34 }} value={draft.role} onChange={(e) => setDraft((d) => ({ ...d, role: e.target.value }))} placeholder="Titre / Rôle" />
                    ) : (
                      <span className="muted">{r.role}</span>
                    )}
                  </td>
                  <td>
                    {conflict ? (
                      <span className="badge red"><span className="pip" />Conflit</span>
                    ) : (
                      <span className="badge green"><span className="pip" />Disponible</span>
                    )}
                  </td>
                  <td>
                    {editing ? (
                      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn sm primary" onClick={saveEdit}><Icon name="check" size={14} /> Sauvegarder</button>
                        <button className="btn sm" onClick={cancelEdit}><Icon name="x" size={14} /> Annuler</button>
                      </div>
                    ) : (
                      <div className="row" style={{ gap: 6, justifyContent: 'flex-end' }}>
                        <button className="iconbtn" style={{ width: 32, height: 32 }} title="Modifier" onClick={() => startEdit(r)}><Icon name="edit" size={15} /></button>
                        <button className="iconbtn" style={{ width: 32, height: 32 }} title="Retirer" onClick={() => removeRow(r.id)}><Icon name="trash" size={15} /></button>
                      </div>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Add participant */}
      <div className="card" style={{ marginTop: 20 }}>
        <div className="card-head"><h2 className="card-title">Ajouter un participant</h2></div>
        <div className="card-body" style={{ paddingTop: 18 }}>
          <div className="grid-2" style={{ alignItems: 'flex-end' }}>
            <div className="field">
              <label>Nom complet</label>
              <input className="input" placeholder="ex. Dr ADANSI Komla" value={nName} onChange={(e) => setNName(e.target.value)} />
            </div>
            <div className="field">
              <label>Titre / Rôle</label>
              <input className="input" placeholder="ex. Épidémiologiste, GIZ" value={nRole} onChange={(e) => setNRole(e.target.value)} />
            </div>
          </div>
          <div className="between" style={{ marginTop: 16, flexWrap: 'wrap', gap: 12 }}>
            <button className="btn primary" disabled={!nName.trim()} onClick={addRow}><Icon name="plus" size={16} /> Ajouter à la liste</button>
            <button className="link" onClick={() => navigate('/activities/new')} style={{ fontSize: 13 }}><Icon name="upload" size={15} /> Importer depuis un document TDR</button>
          </div>
        </div>
      </div>
    </div>
  )
}
