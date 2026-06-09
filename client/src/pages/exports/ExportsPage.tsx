import Icon, { type IconName } from '../../components/ui/Icon'

export default function ExportsPage() {
  const items: { ico: IconName; title: string; desc: string; fmt: string }[] = [
    { ico: 'list', title: 'Liste des activités', desc: 'Tableau complet des activités du mois (titre, département, dates, statut, participants).', fmt: 'Excel · PDF' },
    { ico: 'alert', title: 'Rapport de conflits', desc: 'Synthèse des conflits de ressources humaines détectés et de leur traitement.', fmt: 'PDF' },
    { ico: 'calendar', title: 'Calendrier mensuel', desc: 'Vue calendrier de juin 2026 avec toutes les activités, par département.', fmt: 'PDF' },
    { ico: 'users', title: 'Plan de charge des agents', desc: 'Répartition des agents par activité sur la période sélectionnée.', fmt: 'Excel' },
  ]
  return (
    <div className="content" style={{ maxWidth: 1000 }}>
      <div className="page-head">
        <div>
          <h1 className="page-title">Exports</h1>
          <p className="page-desc">Générez des rapports institutionnels au format PDF ou Excel</p>
        </div>
      </div>
      <div className="grid-2">
        {items.map((it, i) => (
          <div className="card" key={i}>
            <div className="card-body" style={{ display: 'flex', gap: 14 }}>
              <span style={{ width: 42, height: 42, borderRadius: 8, flex: 'none', background: 'var(--blue-50)', color: 'var(--blue-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--blue-100)' }}>
                <Icon name={it.ico} size={20} />
              </span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 14 }}>{it.title}</div>
                <div className="muted" style={{ fontSize: 12.5, marginTop: 3, lineHeight: 1.45 }}>{it.desc}</div>
                <div className="between" style={{ marginTop: 12 }}>
                  <span className="badge slate" style={{ fontSize: 10.5 }}>{it.fmt}</span>
                  <button className="btn sm"><Icon name="download" size={15} /> Télécharger</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
