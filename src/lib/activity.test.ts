import { describe, expect, it } from 'vitest'
import { buildWeeks, summarize, weekStart } from './activity.ts'

const base = {
  dailyCounts: {} as Record<string, number>,
  prDates: [] as string[],
  documentDates: [] as string[],
  documentsSince: '2000-01-01',
  weeks: 3,
  today: '2026-10-21',
}

describe('weekStart', () => {
  it('returns the Sunday on or before the date', () => {
    expect(weekStart('2026-10-21')).toBe('2026-10-18')
    expect(weekStart('2026-10-18')).toBe('2026-10-18')
    expect(weekStart('2026-01-01')).toBe('2025-12-28')
  })
})

describe('buildWeeks', () => {
  it('returns the requested weeks oldest first, ending with the week of today', () => {
    const weeks = buildWeeks(base)
    expect(weeks.map((w) => w.start)).toEqual(['2026-10-04', '2026-10-11', '2026-10-18'])
    for (const week of weeks) expect(week.days).toHaveLength(7)
  })

  it('nulls days after today and zeroes days missing from the counts', () => {
    const last = buildWeeks({ ...base, dailyCounts: { '2026-10-18': 3 } })[2]
    expect(last.days.slice(0, 4)).toEqual([3, 0, 0, 0])
    expect(last.days.slice(4)).toEqual([null, null, null])
  })

  it('places a daily count on its weekday', () => {
    const last = buildWeeks({ ...base, dailyCounts: { '2026-10-20': 5 } })[2]
    expect(last.days[2]).toBe(5)
  })

  it('adds pull request dates to their week and ignores dates outside the window', () => {
    const weeks = buildWeeks({
      ...base,
      prDates: ['2026-10-19', '2026-10-21', '2026-10-05', '2026-09-30'],
    })
    expect(weeks.map((w) => w.prs)).toEqual([1, 0, 2])
  })

  it('leaves documents null before documentsSince and counts them after', () => {
    const weeks = buildWeeks({
      ...base,
      documentsSince: '2026-10-11',
      documentDates: ['2026-10-12', '2026-10-13', '2026-10-19', '2026-10-05'],
    })
    expect(weeks.map((w) => w.documents)).toEqual([null, 2, 1])
  })
})

describe('summarize', () => {
  it('totals contributions, pull requests and documents with nulls as zero', () => {
    const weeks = buildWeeks({
      ...base,
      dailyCounts: { '2026-10-05': 2, '2026-10-12': 3, '2026-10-20': 5 },
      prDates: ['2026-10-05', '2026-10-19'],
      documentsSince: '2026-10-11',
      documentDates: ['2026-10-12', '2026-10-19', '2026-10-20'],
    })
    expect(summarize(weeks)).toEqual({
      contributions: 10,
      prs: 2,
      documents: 3,
      since: '2026-10-04',
      documentsSince: '2026-10-11',
    })
  })

  it('reports no documentsSince when every week has null documents', () => {
    const weeks = buildWeeks({ ...base, documentsSince: '2027-01-01' })
    expect(summarize(weeks).documentsSince).toBeNull()
    expect(summarize(weeks).documents).toBe(0)
  })
})
