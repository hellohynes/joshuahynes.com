import { describe, expect, it } from 'vitest'
import { DEPTH_ALPHA_MIN, depthAlpha } from './depth.ts'

describe('depthAlpha', () => {
  it('is the minimum for the oldest week and exactly 1 for the newest', () => {
    expect(depthAlpha(0, 80)).toBe(DEPTH_ALPHA_MIN)
    expect(depthAlpha(79, 80)).toBe(1)
  })

  it('rises strictly with every newer week', () => {
    for (let i = 1; i < 80; i++) expect(depthAlpha(i, 80)).toBeGreaterThan(depthAlpha(i - 1, 80))
  })

  it('stays inside the range', () => {
    for (let i = 0; i < 80; i++) {
      const alpha = depthAlpha(i, 80)
      expect(alpha).toBeGreaterThanOrEqual(DEPTH_ALPHA_MIN)
      expect(alpha).toBeLessThanOrEqual(1)
    }
  })

  it('keeps the newest weeks clearly strong', () => {
    expect(depthAlpha(75, 80)).toBeGreaterThan(0.9)
  })

  it('is fully strong for a single row', () => {
    expect(depthAlpha(0, 1)).toBe(1)
  })
})
