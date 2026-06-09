import { useState } from 'react'
import Icon from '../../components/ui/Icon'

export default function ProfilePage() {
  const [photoZone, setPhotoZone] = useState(true)
  const [name, setName] = useState('Dr SANNI Yawa Justine')
  const [dept, setDept] = useState("Institut National d'Hygiène")
  const [banner, setBanner] = useState<null | 'unsaved' | 'saved'>(null)
  const [cur, setCur] = useState('')
  const [npw, setNpw] = useState('')
  const [cpw, setCpw] = useState('')
  const [s1, setS1] = useState(false)
  const [s2, setS2] = useState(false)
  const [s3, setS3] = useState(false)

  const dirty = name !== 'Dr SANNI Yawa Justine' || dept !== "Institut National d'Hygiène"

  function saveInfo() {
    setBanner('saved')
    setTimeout(() => setBanner((b) => (b === 'saved' ? null : b)), 3000)
  }
  function cancelInfo() {
    setName('Dr SANNI Yawa Justine')
    setDept("Institut National d'Hygiène")
    setBanner(null)
  }
  function onEdit(setter: (v: string) => void) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value)
      setBanner('unsaved')
    }
  }

  const strength = (() => {
    let s = 0
    if (npw.length >= 8) s++
    if (/[A-Z]/.test(npw) && /[a-z]/.test(npw)) s++
    if (/\d/.test(npw) && /[^A-Za-z0-9]/.test(npw)) s++
    return s
  })()
  const strengthMeta = [
    { label: '—', color: 'var(--line-strong)' },
    { label: 'faible', color: 'var(--red)' },
    { label: 'moyen', color: 'var(--amber)' },
    { label: 'fort', color: 'var(--green)' },
  ][strength]

  const Pw = ({ label, value, onChange, show, setShow }: { label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; show: boolean; setShow: (fn: (s: boolean) => boolean) => void }) => (
    <div className="field" style={{ marginBottom: 16 }}>
      <label>{label}</label>
      <div style={{ position: 'relative' }}>
        <input className="input" style={{ paddingRight: 42 }} type={show ? 'text' : 'password'} value={value} onChange={onChange} placeholder="••••••••" />
        <button type="button" className="pw-toggle" onClick={() => setShow((s) => !s)}><Icon name={show ? 'eyeOff' : 'eye'} size={17} /></button>
      </div>
    </div>
  )

  return (
    <div className="content">
      <div className="row" style={{ gap: 7, fontSize: 12.5, color: 'var(--muted)', fontWeight: 600, marginBottom: 14 }}>
        <span style={{ color: 'var(--ink-2)' }}>Mon profil</span>
      </div>

      <div className="page-head">
        <div>
          <h1 className="page-title">Mon profil</h1>
          <p className="page-desc">Gérez vos informations personnelles et votre mot de passe</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 35fr) 65fr', gap: 20, alignItems: 'start' }}>
        {/* LEFT — profile card */}
        <div className="card">
          <div className="card-body" style={{ paddingTop: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 72, height: 72 }}>
                <div className="avatar" style={{ width: 72, height: 72, fontSize: 26, borderWidth: 1 }}>SY</div>
                <button className="pf-edit" title="Changer la photo" onClick={() => setPhotoZone((v) => !v)}><Icon name="edit" size={13} /></button>
              </div>

              {photoZone && (
                <div className="pf-drop">
                  <Icon name="upload" size={20} />
                  <div style={{ fontWeight: 700, fontSize: 12.5, marginTop: 6 }}>Glisser une photo ou cliquer pour choisir</div>
                  <div className="muted" style={{ fontSize: 11.5, marginTop: 2 }}>JPG, PNG — max 2 Mo</div>
                </div>
              )}

              <div style={{ fontWeight: 700, fontSize: 15.5, marginTop: 14 }}>Dr SANNI Yawa Justine</div>
              <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>Chef de département · INH</div>
            </div>

            <div className="divider" style={{ margin: '18px 0' }} />

            <div className="stack">
              <div className="between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', gap: 12 }}>
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Email</span>
                <span className="row" style={{ gap: 6, fontSize: 12.5, fontWeight: 600, color: 'var(--ink-2)' }}>
                  <span style={{ color: 'var(--muted-2)' }}><Icon name="lock" size={13} /></span>
                  <span className="mono" style={{ fontSize: 12 }}>sanni.yawa@sante.gouv.tg</span>
                </span>
              </div>
              <div className="between" style={{ padding: '9px 0', borderBottom: '1px solid var(--line)', gap: 12 }}>
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Rôle</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>Chef de département</span>
              </div>
              <div className="between" style={{ padding: '9px 0', gap: 12 }}>
                <span className="muted" style={{ fontSize: 12.5, fontWeight: 600 }}>Membre depuis</span>
                <span style={{ fontSize: 13, fontWeight: 600 }}>janvier 2026</span>
              </div>
            </div>

            <div className="pf-note">
              <Icon name="lock" size={12} /> L'adresse email ne peut pas être modifiée car elle est liée à votre compte gouvernemental.
            </div>
          </div>
        </div>

        {/* RIGHT — edit forms */}
        <div className="stack" style={{ gap: 20 }}>
          {banner === 'unsaved' && (
            <div className="row" style={{ gap: 10, border: '1px solid var(--amber-line)', background: 'var(--amber-bg)', borderRadius: 8, padding: '12px 16px', color: 'var(--amber)' }}>
              <Icon name="alert" size={17} /><span style={{ fontSize: 13, color: 'var(--ink-2)', fontWeight: 600 }}>Vous avez des modifications non enregistrées.</span>
            </div>
          )}
          {banner === 'saved' && (
            <div className="row" style={{ gap: 10, border: '1px solid var(--green-line)', background: 'var(--green-bg)', borderRadius: 8, padding: '12px 16px', color: 'var(--green)' }}>
              <Icon name="check" size={17} /><span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 600 }}>Vos informations ont été mises à jour.</span>
            </div>
          )}

          {/* Card 1 — infos personnelles */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Informations personnelles</h2></div>
            <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="field">
                <label>Nom complet</label>
                <input className="input input-edit" value={name} onChange={onEdit(setName)} />
              </div>
              <div className="field">
                <label>Département</label>
                <input className="input input-edit" value={dept} onChange={onEdit(setDept)} />
              </div>
              <div className="field">
                <label>Adresse email</label>
                <div className="readonly-field">
                  <span style={{ color: 'var(--muted-2)' }}><Icon name="lock" size={14} /></span>
                  <span className="mono" style={{ fontSize: 13 }}>sanni.yawa@sante.gouv.tg</span>
                </div>
              </div>
            </div>
            <div className="row" style={{ gap: 10, justifyContent: 'flex-end', padding: '0 18px 18px' }}>
              <button className="btn ghost" onClick={cancelInfo} disabled={!dirty}>Annuler</button>
              <button className="btn primary" onClick={saveInfo} disabled={!dirty}><Icon name="check" size={15} /> Enregistrer les modifications</button>
            </div>
          </div>

          {/* Card 2 — mot de passe */}
          <div className="card">
            <div className="card-head"><h2 className="card-title">Changer le mot de passe</h2></div>
            <div className="card-body">
              <Pw label="Mot de passe actuel" value={cur} onChange={(e) => setCur(e.target.value)} show={s1} setShow={setS1} />
              <div className="field" style={{ marginBottom: 10 }}>
                <label>Nouveau mot de passe</label>
                <div style={{ position: 'relative' }}>
                  <input className="input" style={{ paddingRight: 42 }} type={s2 ? 'text' : 'password'} value={npw} onChange={(e) => setNpw(e.target.value)} placeholder="••••••••" />
                  <button type="button" className="pw-toggle" onClick={() => setS2((s) => !s)}><Icon name={s2 ? 'eyeOff' : 'eye'} size={17} /></button>
                </div>
                <div className="pw-strength">
                  {[1, 2, 3].map((seg) => <span key={seg} className="pw-seg" style={{ background: strength >= seg ? strengthMeta.color : 'var(--line)' }} />)}
                  <span className="pw-strength-label" style={{ color: strengthMeta.color }}>{strengthMeta.label}</span>
                </div>
              </div>
              <Pw label="Confirmer le nouveau mot de passe" value={cpw} onChange={(e) => setCpw(e.target.value)} show={s3} setShow={setS3} />
            </div>
            <div className="row" style={{ gap: 10, justifyContent: 'flex-end', padding: '0 18px 14px' }}>
              <button className="btn ghost">Annuler</button>
              <button className="btn primary"><Icon name="lock" size={14} /> Mettre à jour le mot de passe</button>
            </div>
            <div className="pf-note" style={{ margin: '0 18px 18px' }}>
              Le mot de passe doit contenir au moins 8 caractères, une majuscule et un chiffre.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
