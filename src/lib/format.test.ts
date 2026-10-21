import { describe, expect, it } from 'vitest'
import { count, monthDay, totalsLine, withYear } from './format.ts'

describe('dates', () => {
  it('formats a YYYY-MM-DD date as written, whatever the time zone', () => {
    expect(monthDay('2025-04-13')).toBe('Apr 13')
    expect(withYear('2026-10-21')).toBe('Oct 21, 2026')
  })

  it('adds days across a month and a year', () => {
    expect(monthDay('2026-01-28', 6)).toBe('Feb 3')
    expect(withYear('2025-12-28', 6)).toBe('Jan 3, 2026')
  })
})

describe('count', () => {
  it('groups thousands and pluralises', () => {
    expect(count(3848, 'contribution')).toBe('3,848 contributions')
    expect(count(1, 'pull request')).toBe('1 pull request')
    expect(count(0, 'document')).toBe('0 documents')
  })
})

describe('totalsLine', () => {
  const summary = { contributions: 3848, prs: 743, documents: 2924, since: '2025-04-13', documentsSince: '2026-02-08' }

  it('reads as one sentence with the window start first and the snapshot date last', () => {
    expect(totalsLine({ summary, documentsSince: '2026-02-10', generated: '2026-10-21' })).toBe(
      'Since Apr 13, 2025: 3,848 contributions · 743 pull requests · 2,924 documents written with AI agents since Feb 10, 2026 · updated Oct 21, 2026',
    )
  })

  it('leaves out the documents clause when there is no documents data', () => {
    expect(
      totalsLine({ summary: { ...summary, documents: 0, documentsSince: null }, documentsSince: '2026-02-10', generated: '2026-10-21' }),
    ).toBe('Since Apr 13, 2025: 3,848 contributions · 743 pull requests · updated Oct 21, 2026')
  })
})
