import { describe, expect, it } from 'vitest'
import { drawProgress } from './drawin.ts'

const STAGGER = 5
const LINE = 700

describe('drawProgress', () => {
  it('is 0 before the line starts', () => {
    expect(drawProgress(0, 10, STAGGER, LINE)).toBe(0)
    expect(drawProgress(49, 10, STAGGER, LINE)).toBe(0)
  })

  it('starts index 0 at elapsed 0', () => {
    expect(drawProgress(0, 0, STAGGER, LINE)).toBe(0)
    expect(drawProgress(1, 0, STAGGER, LINE)).toBeGreaterThan(0)
  })

  it('is exactly 1 at start + duration and after', () => {
    expect(drawProgress(10 * STAGGER + LINE, 10, STAGGER, LINE)).toBe(1)
    expect(drawProgress(10 * STAGGER + LINE + 500, 10, STAGGER, LINE)).toBe(1)
  })

  it('is strictly between 0 and 1 at the midpoint', () => {
    const mid = drawProgress(10 * STAGGER + LINE / 2, 10, STAGGER, LINE)
    expect(mid).toBeGreaterThan(0)
    expect(mid).toBeLessThan(1)
  })

  it('eases out: 0.875 at half the duration', () => {
    expect(drawProgress(LINE / 2, 0, STAGGER, LINE)).toBeCloseTo(0.875, 10)
  })

  it('starts later lines later', () => {
    expect(drawProgress(100, 0, STAGGER, LINE)).toBeGreaterThan(drawProgress(100, 79, STAGGER, LINE))
  })

  it('draws every line identically with no stagger', () => {
    expect(drawProgress(300, 0, 0, LINE)).toBe(drawProgress(300, 79, 0, LINE))
  })
})
