/* Mock data for GestiActivités — mirrors the design prototype.
   Replace with live API data (see hooks/) once the backend is seeded. */

export interface Dept {
  id: string
  name: string
  short: string
  color: string
  bg: string
  line: string
}

export interface Staff {
  id: string
  name: string
  role: string
  dept: string
}

export type StatusKey = 'Brouillon' | 'Soumis' | 'Actif' | 'Terminé'
export type StatusTone = 'slate' | 'amber' | 'green' | 'blue'

export interface Activity {
  id: string
  title: string
  dept: string
  type: string
  start: string
  end: string
  startD: number
  endD: number
  venue: string
  ref: string
  status: StatusKey
  people: string[]
}

export interface ConflictItem {
  id: string
  staff: string
  activities: string[]
  overlap: string
}

export const DEPTS: Record<string, Dept> = {
  INH:  { id: 'INH',  name: "Institut National d'Hygiène",                     short: 'INH',      color: '#185FA5', bg: '#E9F1FA', line: '#C9DDF1' },
  DSE:  { id: 'DSE',  name: 'Direction de la Surveillance Épidémiologique',     short: 'DSE',      color: '#0E7C4A', bg: '#E6F3EC', line: '#C3E2D0' },
  MSHP: { id: 'MSHP', name: 'MSHPCSUA',                                          short: 'MSHPCSUA', color: '#9A6B12', bg: '#FAF1DE', line: '#ECD9AC' },
  PNLP: { id: 'PNLP', name: 'Programme National de Lutte contre le Paludisme',  short: 'PNLP',     color: '#7A4FA3', bg: '#F1EBF7', line: '#DCCBEC' },
}

export const STAFF: Record<string, Staff> = {
  sanni:   { id: 'sanni',   name: 'Dr SANNI Yawa Justine', role: 'Biologiste',         dept: 'INH' },
  assih:   { id: 'assih',   name: 'Dr ASSIH Maléki, PhD',  role: 'Biologiste',         dept: 'INH' },
  bidjada: { id: 'bidjada', name: 'M. BIDJADA Bawimodom',  role: 'Ing. Biologiste',    dept: 'INH' },
  tossa:   { id: 'tossa',   name: 'Dr TOSSA Christelle',   role: 'Médecin Biologiste', dept: 'INH' },
  azon:    { id: 'azon',    name: 'Mme AZON Afi',          role: 'TSL',                dept: 'INH' },
  komlan:  { id: 'komlan',  name: 'Dr KOMLAN Édem',        role: 'Épidémiologiste',    dept: 'DSE' },
  agbeko:  { id: 'agbeko',  name: 'M. AGBEKO Selom',       role: 'Statisticien',       dept: 'DSE' },
  dosseh:  { id: 'dosseh',  name: 'Mme DOSSEH Akouvi',     role: 'Gestionnaire',       dept: 'MSHP' },
  lawson:  { id: 'lawson',  name: 'Dr LAWSON Kossi',       role: 'Entomologiste',      dept: 'PNLP' },
  foli:    { id: 'foli',    name: 'Mme FOLI Amivi',        role: 'TSL',                dept: 'INH' },
  amela:   { id: 'amela',   name: 'M. AMELA Komi',         role: 'Logisticien',        dept: 'INH' },
  kpodar:  { id: 'kpodar',  name: 'Dr KPODAR Sena',        role: 'Médecin',            dept: 'DSE' },
}

export const STATUS: Record<StatusKey, StatusTone> = {
  Brouillon: 'slate',
  Soumis: 'amber',
  Actif: 'green',
  Terminé: 'blue',
}

export const ACTIVITIES: Activity[] = [
  { id: 'A1', title: 'Atelier de rédaction de manuscrits scientifiques', dept: 'INH',  type: 'Atelier',  start: '2026-06-02', end: '2026-06-05', startD: 2,  endD: 5,  venue: 'Hôtel MORIJA, Tsévié',          ref: 'INH/2026/041',  status: 'Actif',     people: ['sanni', 'assih', 'bidjada', 'tossa', 'azon'] },
  { id: 'A2', title: 'Formation en surveillance épidémiologique',        dept: 'DSE',  type: 'Formation', start: '2026-06-03', end: '2026-06-06', startD: 3,  endD: 6,  venue: 'Salle de conférence DSE, Lomé', ref: 'DSE/2026/018',  status: 'Actif',     people: ['assih', 'komlan', 'agbeko', 'kpodar'] },
  { id: 'A3', title: 'Mission terrain — collecte de données',            dept: 'PNLP', type: 'Mission',   start: '2026-06-02', end: '2026-06-03', startD: 2,  endD: 3,  venue: 'Région des Plateaux',          ref: 'PNLP/2026/007', status: 'Soumis',    people: ['bidjada', 'lawson'] },
  { id: 'A4', title: 'Réunion de coordination mensuelle',                dept: 'MSHP', type: 'Réunion',   start: '2026-06-10', end: '2026-06-10', startD: 10, endD: 10, venue: 'Cabinet du Ministre, Lomé',    ref: 'MSHP/2026/052', status: 'Soumis',    people: ['dosseh', 'komlan', 'sanni'] },
  { id: 'A5', title: "Atelier de validation du plan d'action",           dept: 'INH',  type: 'Atelier',   start: '2026-06-16', end: '2026-06-17', startD: 16, endD: 17, venue: 'Hôtel SARAKAWA, Lomé',         ref: 'INH/2026/045',  status: 'Brouillon', people: ['sanni', 'tossa', 'foli'] },
  { id: 'A6', title: 'Formation en hygiène hospitalière',                dept: 'DSE',  type: 'Formation', start: '2026-06-22', end: '2026-06-24', startD: 22, endD: 24, venue: 'CHU Sylvanus Olympio',         ref: 'DSE/2026/021',  status: 'Actif',     people: ['kpodar', 'agbeko', 'azon'] },
  { id: 'A7', title: 'Mission de supervision régionale',                 dept: 'PNLP', type: 'Mission',   start: '2026-06-25', end: '2026-06-27', startD: 25, endD: 27, venue: 'Région de la Kara',            ref: 'PNLP/2026/009', status: 'Soumis',    people: ['lawson', 'amela'] },
  { id: 'A8', title: 'Atelier bilan du trimestre',                       dept: 'MSHP', type: 'Atelier',   start: '2026-05-26', end: '2026-05-27', startD: -5, endD: -4, venue: 'Hôtel 2 Février, Lomé',        ref: 'MSHP/2026/048', status: 'Terminé',   people: ['dosseh', 'sanni', 'komlan'] },
]

/* Conflicts: same person on overlapping activities */
export const CONFLICTS: ConflictItem[] = [
  { id: 'C1', staff: 'assih',   activities: ['A1', 'A2'], overlap: '03 – 05 juin 2026' },
  { id: 'C2', staff: 'bidjada', activities: ['A1', 'A3'], overlap: '02 – 03 juin 2026' },
]

/* staff with no assignment in the conflict window — available for swap */
export const AVAILABLE = ['tossa', 'foli', 'amela', 'kpodar', 'dosseh']

/* ---- Activity detail dataset (shared by detail / edit / participants) ---- */
export interface PersonRow {
  name: string
  role: string
  status?: 'Conflit' | 'Disponible' | 'Nouveau'
  note?: string
}

export const DETAIL = {
  title: "Atelier de rédaction et d'élaboration de drafts de manuscrits scientifiques",
  ref: 'INH/2026/041',
  type: 'Atelier',
  deptShort: 'INH',
  deptName: "Institut National d'Hygiène",
  deptColor: '#185FA5',
  deptBg: '#E9F1FA',
  deptLine: '#C9DDF1',
  start: '02 juin 2026',
  end: '05 juin 2026',
  rangeShort: '02 – 05 juin 2026',
  duration: '4 jours',
  venue: 'Hôtel MORIJA, Tsévié — Zio',
  submitter: 'Dr HALATOKO Wemboo Afiwa',
  submittedOn: '20 mai 2026',
  status: 'Actif' as StatusKey,
  totalParticipants: 19,
}

export const DET_PARTICIPANTS: PersonRow[] = [
  { name: 'Dr ASSIH Maléki, PhD',     role: 'Biologiste · INH',              status: 'Conflit',    note: 'Formation en surveillance, 03–04 juin' },
  { name: 'M. BIDJADA Bawimodom',     role: 'Ing. Biologiste · INH',         status: 'Conflit',    note: 'Mission terrain, 02 juin' },
  { name: 'Dr SANNI Yawa Justine',    role: 'Biologiste · INH',              status: 'Disponible' },
  { name: 'Dr TOSSA Christelle',      role: 'Médecin Biologiste · INH',      status: 'Disponible' },
  { name: 'Dr BADJABAISSI Essotolom', role: 'Pharmacien toxicologue · INH',  status: 'Disponible' },
  { name: 'Mme KPAIKPAI Pirenam',     role: 'Gestionnaire données · INH',    status: 'Disponible' },
  { name: 'Dr DOSSEH Akouvi Délali',  role: 'Médecin Biologiste · INH',      status: 'Disponible' },
  { name: 'M. AGBEKO Selom',          role: 'Statisticien · DSE',            status: 'Disponible' },
  { name: 'Mme AZON Afi',             role: 'TSL · INH',                     status: 'Disponible' },
  { name: 'Dr KOMLAN Édem',           role: 'Épidémiologiste · DSE',         status: 'Disponible' },
  { name: 'M. AMELA Komi',            role: 'Logisticien · INH',             status: 'Disponible' },
  { name: 'Mme FOLI Amivi',           role: 'TSL · INH',                     status: 'Disponible' },
  { name: 'Dr KPODAR Sena',           role: 'Médecin · DSE',                 status: 'Disponible' },
  { name: 'M. LAWSON Kossi',          role: 'Entomologiste · PNLP',          status: 'Disponible' },
  { name: 'Dr AHODÉKON Sénamé',       role: 'Biologiste · INH',              status: 'Disponible' },
  { name: 'Mme TCHALLA Essossinam',   role: 'Assistante de recherche · INH', status: 'Disponible' },
  { name: 'M. GNASSOUNOU Tchaa',      role: 'Technicien labo · INH',         status: 'Disponible' },
  { name: 'Dr ABALO Yaovi',           role: 'Pharmacien · INH',              status: 'Disponible' },
  { name: 'Mme PALI Tchédré',         role: 'Gestionnaire · MSHPCSUA',       status: 'Disponible' },
]

export const DET_FACILITATORS: PersonRow[] = [
  { name: 'Dr HALATOKO Wemboo Afiwa', role: 'Biologiste · INH' },
  { name: 'Dr SADJI Adodo Yao',       role: 'Biologiste · INH' },
  { name: 'M. KOBA Adjaho Komla',     role: 'Biologiste · INH' },
  { name: 'Dr ZIDA COMPAORE IDA, PhD', role: 'GIZ' },
]

export function initials(name: string): string {
  const clean = name.replace(/^(Dr|M\.|Mme|Mlle|Pr)\s+/, '').trim()
  const parts = clean.split(/\s+/)
  return ((parts[0] || '')[0] || '') + ((parts[1] || '')[0] || '')
}
