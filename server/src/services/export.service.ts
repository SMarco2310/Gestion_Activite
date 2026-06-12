import PDFDocument from 'pdfkit'
import ExcelJS from 'exceljs'
import { query, queryOne } from '../lib/db'
import logger from '../lib/logger'

interface ActivityRow {
  title: string
  department: string
  referenceNumber: string | null
  startDate: string
  endDate: string
  venue: string
  status: string
}

interface ParticipantRow {
  fullName: string
  titleRole: string
  participantType: string
  availabilityStatus: string
}

const formatDate = (d: string) => new Date(`${d}T00:00:00`).toLocaleDateString('fr-FR')

const AVAIL_LABEL: Record<string, string> = {
  disponible: 'Disponible',
  conflit: 'Conflit',
  nouveau: 'Nouveau',
}

const ACTIVITY_SELECT =
  'SELECT title, department, "referenceNumber", "startDate", "endDate", venue, status FROM activities WHERE id = $1'
const PARTICIPANT_SELECT =
  'SELECT "fullName", "titleRole", "participantType", "availabilityStatus" FROM activity_participants WHERE "activityId" = $1 ORDER BY "participantType" DESC, "fullName" ASC'

export const exportService = {
  async generatePdf(activityId: string): Promise<Buffer> {
    const activity = await queryOne<ActivityRow>(ACTIVITY_SELECT, [activityId])
    if (!activity) throw new Error('Activity not found')
    const participants = await query<ParticipantRow>(PARTICIPANT_SELECT, [activityId])

    const doc = new PDFDocument({ size: 'A4', margin: 50 })
    const chunks: Buffer[] = []
    doc.on('data', (c: Buffer) => chunks.push(c))
    const done = new Promise<Buffer>((resolve, reject) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)))
      doc.on('error', reject)
    })

    const ink = '#1A2B45'
    const muted = '#64748B'
    const line = '#E2E8F0'

    // Header
    doc.fillColor(muted).fontSize(9).text('Ministère de la Santé et de l\'Hygiène Publique — République Togolaise')
    doc.moveDown(0.5)
    doc.fillColor(ink).fontSize(18).font('Helvetica-Bold').text(activity.title)
    doc.moveDown(0.4)

    // Meta block
    doc.font('Helvetica').fontSize(10).fillColor(muted)
    const meta: [string, string][] = [
      ['Référence', activity.referenceNumber || '—'],
      ['Département', activity.department],
      ['Dates', `${formatDate(activity.startDate)} — ${formatDate(activity.endDate)}`],
      ['Lieu', activity.venue],
      ['Statut', activity.status],
    ]
    meta.forEach(([k, v]) => {
      doc.fillColor(muted).font('Helvetica-Bold').text(`${k} : `, { continued: true })
      doc.fillColor(ink).font('Helvetica').text(v)
    })

    doc.moveDown(1)
    doc.fillColor(ink).font('Helvetica-Bold').fontSize(13).text(`Participants (${participants.length})`)
    doc.moveDown(0.5)

    // Table
    const left = doc.page.margins.left
    const right = doc.page.width - doc.page.margins.right
    const cols = { num: left, name: left + 35, role: left + 270, status: right - 90 }

    const drawRow = (n: string, name: string, role: string, status: string, bold = false) => {
      const y = doc.y
      doc.font(bold ? 'Helvetica-Bold' : 'Helvetica').fontSize(9.5).fillColor(bold ? ink : '#334155')
      doc.text(n, cols.num, y, { width: 30 })
      doc.text(name, cols.name, y, { width: cols.role - cols.name - 8 })
      doc.text(role, cols.role, y, { width: cols.status - cols.role - 8 })
      doc.text(status, cols.status, y, { width: right - cols.status })
      doc.moveDown(0.5)
      doc.strokeColor(line).lineWidth(0.5).moveTo(left, doc.y - 2).lineTo(right, doc.y - 2).stroke()
      doc.moveDown(0.2)
    }

    drawRow('N°', 'Nom & Prénoms', 'Titre / Rôle', 'Statut', true)
    participants.forEach((p, i) => {
      if (doc.y > doc.page.height - 80) doc.addPage()
      const tag = p.participantType === 'facilitateur' ? 'Facilitateur' : AVAIL_LABEL[p.availabilityStatus] || p.availabilityStatus
      drawRow(String(i + 1), p.fullName, p.titleRole, tag)
    })

    // Footer
    doc.moveDown(2)
    doc.fontSize(8).fillColor(muted).text(`Document généré le ${new Date().toLocaleDateString('fr-FR')} — GestiActivités`, left, doc.y, { align: 'center', width: right - left })

    doc.end()
    const buffer = await done
    logger.info('PDF generated', { activityId, bytes: buffer.length })
    return buffer
  },

  async generateExcel(activityId: string): Promise<Buffer> {
    const activity = await queryOne<ActivityRow>(ACTIVITY_SELECT, [activityId])
    if (!activity) throw new Error('Activity not found')
    const participants = await query<ParticipantRow>(PARTICIPANT_SELECT, [activityId])

    const wb = new ExcelJS.Workbook()
    wb.creator = 'GestiActivités'
    wb.created = new Date()
    const ws = wb.addWorksheet('Participants')

    // Title / meta rows
    ws.mergeCells('A1:D1')
    ws.getCell('A1').value = activity.title
    ws.getCell('A1').font = { bold: true, size: 14 }
    ws.getCell('A2').value = `Référence : ${activity.referenceNumber || '—'}`
    ws.getCell('A3').value = `Dates : ${formatDate(activity.startDate)} — ${formatDate(activity.endDate)}`
    ws.getCell('A4').value = `Lieu : ${activity.venue}`

    // Spacer + header row
    ws.addRow([])
    ws.addRow(['N°', 'Nom & Prénoms', 'Titre / Rôle', 'Statut'])
    const header = ws.lastRow!
    header.font = { bold: true }
    header.eachCell((c) => {
      c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE9F1FA' } }
      c.border = { bottom: { style: 'thin', color: { argb: 'FFC9DDF1' } } }
    })

    participants.forEach((p, i) => {
      const tag = p.participantType === 'facilitateur' ? 'Facilitateur' : AVAIL_LABEL[p.availabilityStatus] || p.availabilityStatus
      ws.addRow([i + 1, p.fullName, p.titleRole, tag])
    })

    ws.columns = [
      { width: 6 },
      { width: 34 },
      { width: 30 },
      { width: 16 },
    ]

    const buffer = Buffer.from(await wb.xlsx.writeBuffer())
    logger.info('Excel generated', { activityId, bytes: buffer.length })
    return buffer
  },
}
