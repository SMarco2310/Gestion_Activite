import { query, queryOne } from '../lib/db'
import logger from '../lib/logger'

interface ActivityRow {
  title: string
  department: string
  startDate: string
  endDate: string
}

interface ParticipantRow {
  fullName: string
  titleRole: string
  availabilityStatus: string
}

const formatDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR')

export const exportService = {
  async generatePdf(activityId: string): Promise<Buffer> {
    const activity = await queryOne<ActivityRow>(
      'SELECT title, department, "startDate", "endDate" FROM activities WHERE id = $1',
      [activityId]
    )
    if (!activity) throw new Error('Activity not found')

    const participants = await query<ParticipantRow>(
      'SELECT "fullName", "titleRole", "availabilityStatus" FROM activity_participants WHERE "activityId" = $1 ORDER BY "fullName" ASC',
      [activityId]
    )

    // Build a simple HTML string — use a headless browser or jsPDF on the server
    // For now returns a placeholder — wire up puppeteer or @react-pdf/renderer in production
    const html = `
      <html><body>
        <h1>${activity.title}</h1>
        <p>Département: ${activity.department}</p>
        <p>Dates: ${formatDate(activity.startDate)} — ${formatDate(activity.endDate)}</p>
        <h2>Participants (${participants.length})</h2>
        <table border="1" cellpadding="6" cellspacing="0">
          <tr><th>N°</th><th>Nom & Prénoms</th><th>Titre / Rôle</th></tr>
          ${participants.map((p, i) => `<tr><td>${i + 1}</td><td>${p.fullName}</td><td>${p.titleRole}</td></tr>`).join('')}
        </table>
      </body></html>
    `
    logger.info('PDF generated', { activityId })
    return Buffer.from(html)
  },

  async generateExcel(activityId: string): Promise<Buffer> {
    const activity = await queryOne<ActivityRow>(
      'SELECT title FROM activities WHERE id = $1',
      [activityId]
    )
    if (!activity) throw new Error('Activity not found')

    const participants = await query<ParticipantRow>(
      'SELECT "fullName", "titleRole", "availabilityStatus" FROM activity_participants WHERE "activityId" = $1 ORDER BY "fullName" ASC',
      [activityId]
    )

    // Build CSV as a simple Excel-compatible format
    // Wire up SheetJS (xlsx) for full .xlsx support
    const rows: (string | number)[][] = [
      ['N°', 'Nom & Prénoms', 'Titre / Rôle', 'Statut'],
      ...participants.map((p, i) => [i + 1, p.fullName, p.titleRole, p.availabilityStatus]),
    ]
    const csv = rows.map((r) => r.join(',')).join('\n')

    logger.info('Excel generated', { activityId })
    return Buffer.from(csv)
  },
}
