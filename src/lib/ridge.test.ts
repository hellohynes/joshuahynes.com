import { describe, expect, it } from 'vitest'
import type { WeekActivity } from './activity.ts'
import { busyScale, dayAt, monotoneCurve, nearestLine, weekEnd, weekProfile } from './ridge.ts'

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

describe('weekEnd', () => {
  it('is 1 when every day is recorded', () => {
    expect(weekEnd([1, 2, 3, 4, 5, 6, 7])).toBe(1)
  })

  it('ends at the centre of the last recorded day when later days are null', () => {
    expect(weekEnd([3, 9, 1, 20, null, null, null])).toBe(3.5 / 7)
    expect(weekEnd([4, null, null, null, null, null, null])).toBe(0.5 / 7)
  })

  it('is 0 when no day is recorded', () => {
    expect(weekEnd([null, null, null, null, null, null, null])).toBe(0)
  })

  it('is not shortened by a null in the middle', () => {
    expect(weekEnd([1, null, 3, null, 5, 6, 7])).toBe(1)
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

describe('nearestLine', () => {
  const limits = { stick: 10, switchMargin: 6, clearDistance: 14 }
  const pick = (py: number, curveYs: number[], current: number | null = null) =>
    nearestLine({ py, curveYs, current, ...limits })

  it('picks the curve nearest the pointer when nothing is hovered', () => {
    expect(pick(119, [100, 120, 140])).toBe(1)
    expect(pick(101, [100, 120, 140])).toBe(0)
    expect(pick(139, [100, 120, 140])).toBe(2)
  })

  it('breaks a tie towards the newer week', () => {
    expect(pick(110, [100, 120])).toBe(1)
  })

  it('stays on the current line while it is within the stick band, even if another is a little nearer', () => {
    // 8px from curve 0, 2px from curve 1: closer by exactly the margin, so it stays.
    expect(pick(108, [100, 110, 140], 0)).toBe(0)
    expect(pick(105, [100, 110, 140], 0)).toBe(0)
  })

  it('switches when another curve is closer by more than the margin', () => {
    // 9px from curve 0, 1px from curve 1: closer by 8.
    expect(pick(109, [100, 110, 140], 0)).toBe(1)
  })

  it('switches to the nearest curve once the pointer leaves the stick band of the current one', () => {
    // 11px from curve 1 (beyond the band), 9px from curve 2: only 2px closer, but the band is gone.
    expect(pick(131, [100, 120, 140], 1)).toBe(2)
  })

  it('is null when the pointer is farther than the clear distance from every curve', () => {
    expect(pick(160, [100, 120, 140])).toBeNull()
    expect(pick(160, [100, 120, 140], 2)).toBeNull()
    expect(pick(60, [100, 120, 140], 0)).toBeNull()
  })

  it('still selects at exactly the clear distance', () => {
    expect(pick(154, [100, 120, 140])).toBe(2)
    expect(pick(154.5, [100, 120, 140])).toBeNull()
  })

  it('never picks a week whose curve is unreachable (non-finite)', () => {
    expect(pick(119, [100, 120, Infinity])).toBe(1)
    expect(pick(125, [100, 120, NaN])).toBe(1)
    expect(pick(100, [Infinity, NaN])).toBeNull()
  })

  it('drops a current week that has become unreachable', () => {
    expect(pick(119, [100, 120, Infinity], 2)).toBe(1)
    expect(pick(119, [Infinity, NaN], 0)).toBeNull()
  })

  it('does not count an unreachable current week as a stick-band distance', () => {
    expect(pick(131, [100, NaN, 140], 1)).toBe(2)
  })

  it('treats a current week that no longer exists as nothing hovered, and no curves as null', () => {
    expect(pick(119, [100, 120, 140], 7)).toBe(1)
    expect(pick(119, [])).toBeNull()
  })
})

describe('dayAt', () => {
  it('splits the plot width into seven days', () => {
    expect(dayAt(0, 0, 700)).toBe(0)
    expect(dayAt(99, 0, 700)).toBe(0)
    expect(dayAt(100, 0, 700)).toBe(1)
    expect(dayAt(350, 0, 700)).toBe(3)
    expect(dayAt(699, 0, 700)).toBe(6)
  })

  it('clamps outside the plot and honours an offset', () => {
    expect(dayAt(-5, 0, 700)).toBe(0)
    expect(dayAt(700, 0, 700)).toBe(6)
    expect(dayAt(900, 0, 700)).toBe(6)
    expect(dayAt(250, 100, 800)).toBe(1)
  })
})
