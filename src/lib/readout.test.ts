import { describe, expect, it } from 'vitest'
import { hoverProgress } from './readout.ts'

describe('hoverProgress', () => {
  it('runs from 0 to 1 and clamps outside the duration', () => {
    expect(hoverProgress(-50, 700)).toBe(0)
    expect(hoverProgress(0, 700)).toBe(0)
    expect(hoverProgress(700, 700)).toBe(1)
    expect(hoverProgress(5000, 700)).toBe(1)
  })

  it('eases out: fast at first, slow at the end', () => {
    expect(hoverProgress(350, 700)).toBeCloseTo(0.875, 5)
    expect(hoverProgress(70, 700)).toBeGreaterThan(0.2)
    expect(hoverProgress(630, 700) - hoverProgress(560, 700)).toBeLessThan(hoverProgress(70, 700))
  })

  it('treats a zero duration as already finished', () => {
    expect(hoverProgress(0, 0)).toBe(1)
  })
})
