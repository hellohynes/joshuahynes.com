import { describe, expect, it } from 'vitest'
import { site } from '../content/site.ts'
import { count, monthDay, statsLine, withYear } from './format.ts'

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

describe('statsLine', () => {
  it('reads the lead, then the items separated by slashes', () => {
    expect(statsLine(site.stats)).toBe(
      'Since 2025: 3,800+ contributions / 750+ pull requests / 1,200+ commits / 18M+ additions / 7M+ deletions / 3,000+ AI artifacts created / 85+ skills created',
    )
  })

  it('handles a single item', () => {
    expect(statsLine({ lead: 'Since 2025:', items: ['85+ skills created'] })).toBe('Since 2025: 85+ skills created')
  })

  it('is just the lead when there are no items', () => {
    expect(statsLine({ lead: 'Since 2025:', items: [] })).toBe('Since 2025:')
  })
})
