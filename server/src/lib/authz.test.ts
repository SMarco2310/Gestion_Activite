import { describe, it, expect } from 'vitest'
import { canMutateActivity } from './authz'

describe('canMutateActivity', () => {
  const owner = { id: 'u1', role: 'user' }
  const admin = { id: 'u2', role: 'admin' }
  const other = { id: 'u3', role: 'user' }

  it('allows the owner to mutate their activity', () => {
    expect(canMutateActivity('u1', owner)).toBe(true)
  })

  it('allows an admin to mutate any activity', () => {
    expect(canMutateActivity('u1', admin)).toBe(true)
  })

  it('forbids a non-owner non-admin user', () => {
    expect(canMutateActivity('u1', other)).toBe(false)
  })

  it('forbids when the activity does not exist (null owner)', () => {
    expect(canMutateActivity(null, admin)).toBe(false)
    expect(canMutateActivity(null, owner)).toBe(false)
  })
})
