import { describe, expect, it } from 'vitest'
import type { WeekActivity } from './activity.ts'
import { busyScale, hitTest, monotoneCurve, weekProfile } from './ridge.ts'

const week = (days: (number | null)[]): WeekActivity => ({
  start: '2026-01-04',
  days,
  prs: 0,
  documents: null,
})

describe('monotoneCurve', () => {
  const curve = monotoneCurve([0, 1, 2, 3], [0, 1, 1, 4])

  it('passes through every knot', () => {
    expect([0, 1, 2, 3].map(curve)).toEqual([0, 1, 1, 4])
  })

  it('keeps a flat segment flat and a rising one between its knots', () => {
    expect(curve(1.5)).toBeGreaterThanOrEqual(1)
    expect(curve(1.5)).toBeLessThanOrEqual(1)
    expect(curve(2.5)).toBeGreaterThan(1)
    expect(curve(2.5)).toBeLessThan(4)
  })

  it('never overshoots the knot range over a fine sweep', () => {
    for (let x = 0; x <= 3; x += 0.001) {
      expect(curve(x)).toBeGreaterThanOrEqual(0)
      expect(curve(x)).toBeLessThanOrEqual(4)
    }
  })

  it('clamps to the end knot values outside the knots', () => {
    expect(curve(-5)).toBe(0)
    expect(curve(10)).toBe(4)
  })

  it('handles two knots as a line', () => {
    const line = monotoneCurve([0, 2], [1, 5])
    expect(line(0)).toBe(1)
    expect(line(1)).toBeCloseTo(3)
    expect(line(2)).toBe(5)
  })

  it('stays monotone through a peak without overshooting it', () => {
    const peak = monotoneCurve([0, 1, 2, 3], [0, 2, 2, 0])
    for (let x = 0; x <= 3; x += 0.001) expect(peak(x)).toBeLessThanOrEqual(2 + 1e-9)
  })
})

describe('weekProfile', () => {
  it('is 0 everywhere for an all-zero week', () => {
    const profile = weekProfile([0, 0, 0, 0, 0, 0, 0], 5)
    for (const u of [0, 0.25, 0.5, 1]) expect(profile(u)).toBe(0)
  })

  it('is finite (0) everywhere for an all-null week', () => {
    const profile = weekProfile([null, null, null, null, null, null, null], 5)
    for (const u of [0, 0.1, 0.25, 0.5, 0.9, 1]) {
      expect(Number.isFinite(profile(u))).toBe(true)
      expect(profile(u)).toBe(0)
    }
  })

  it('is 0 at both ends of the week', () => {
    const profile = weekProfile([3, 9, 1, 20, 0, 4, 7], 5)
    expect(profile(0)).toBe(0)
    expect(profile(1)).toBe(0)
  })

  it('caps a very busy day at 1.25 at its centre', () => {
    const profile = weekProfile([0, 0, 0, 20, 0, 0, 0], 5)
    expect(profile(3.5 / 7)).toBe(1.25)
  })

  it('gives 1 when the count equals the scale', () => {
    const profile = weekProfile([0, 5, 0, 0, 0, 0, 0], 5)
    expect(profile(1.5 / 7)).toBe(1)
  })
})

describe('busyScale', () => {
  it('is at least 1 for an all-zero set', () => {
    expect(busyScale([week([0, 0, 0, 0, 0, 0, 0])])).toBe(1)
  })

  it('ignores nulls', () => {
    expect(busyScale([week([null, null, null, null, null, null, null])])).toBe(1)
    expect(busyScale([week([7, 7, 7, null, null, null, null])])).toBe(7)
  })

  it('is the 94th percentile of the non-null counts', () => {
    const counts = Array.from({ length: 100 }, (_, i) => i + 1)
    const weeks: WeekActivity[] = []
    for (let i = 0; i < counts.length; i += 7) {
      const chunk: (number | null)[] = counts.slice(i, i + 7)
      while (chunk.length < 7) chunk.push(null)
      weeks.push(week(chunk))
    }
    expect(busyScale(weeks)).toBe(counts[Math.floor(100 * 0.94)])
  })
})

describe('hitTest', () => {
  const grid = { x0: 100, x1: 800, top: 100, bottom: 500, rows: 5 }

  it('finds the first and last cells', () => {
    expect(hitTest({ ...grid, x: 100, y: 100 })).toEqual({ week: 0, day: 0 })
    expect(hitTest({ ...grid, x: 799.9, y: 500 })).toEqual({ week: 4, day: 6 })
  })

  it('treats x exactly at x1 as inside, in the last day', () => {
    expect(hitTest({ ...grid, x: 800, y: 300 })).toEqual({ week: 2, day: 6 })
  })

  it('finds a middle cell', () => {
    expect(hitTest({ ...grid, x: 450, y: 300 })).toEqual({ week: 2, day: 3 })
  })

  it('snaps y to the nearest row', () => {
    expect(hitTest({ ...grid, x: 450, y: 249 })).toEqual({ week: 1, day: 3 })
    expect(hitTest({ ...grid, x: 450, y: 251 })).toEqual({ week: 2, day: 3 })
  })

  it('is null outside the horizontal range', () => {
    expect(hitTest({ ...grid, x: 99, y: 300 })).toBeNull()
    expect(hitTest({ ...grid, x: 801, y: 300 })).toBeNull()
  })

  it('allows up to one row-height outside the vertical range, clamping to the end row', () => {
    expect(hitTest({ ...grid, x: 450, y: 60 })).toEqual({ week: 0, day: 3 })
    expect(hitTest({ ...grid, x: 450, y: 0 })).toEqual({ week: 0, day: 3 })
    expect(hitTest({ ...grid, x: 450, y: 600 })).toEqual({ week: 4, day: 3 })
    expect(hitTest({ ...grid, x: 450, y: 100 - 150 })).toBeNull()
    expect(hitTest({ ...grid, x: 450, y: -1 })).toBeNull()
    expect(hitTest({ ...grid, x: 450, y: 601 })).toBeNull()
  })

  it('returns week 0 for a single row without dividing by zero', () => {
    expect(hitTest({ x: 450, y: 100, x0: 100, x1: 800, top: 100, bottom: 100, rows: 1 })).toEqual({
      week: 0,
      day: 3,
    })
  })
})
