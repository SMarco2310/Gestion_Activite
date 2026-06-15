import { describe, it, expect } from 'vitest'
import { createActivitySchema } from './activity.schema'

const valid = {
  title: 'Atelier de rédaction',
  type: 'atelier' as const,
  department: 'INH',
  startDate: '2026-06-02',
  endDate: '2026-06-05',
  venue: 'Hôtel MORIJA, Tsévié',
}

describe('createActivitySchema', () => {
  it('accepts a valid activity payload', () => {
    const result = createActivitySchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('defaults isUrgent to false when omitted', () => {
    const result = createActivitySchema.parse(valid)
    expect(result.isUrgent).toBe(false)
  })

  it('rejects an end date before the start date', () => {
    const result = createActivitySchema.safeParse({ ...valid, endDate: '2026-06-01' })
    expect(result.success).toBe(false)
  })

  it('rejects a malformed date', () => {
    const result = createActivitySchema.safeParse({ ...valid, startDate: '02/06/2026' })
    expect(result.success).toBe(false)
  })

  it('rejects a missing title', () => {
    const { title: _title, ...noTitle } = valid
    const result = createActivitySchema.safeParse(noTitle)
    expect(result.success).toBe(false)
  })
})
