import { describe, expect, it } from 'vitest'
import type { Item } from '../content/types.ts'
import { findItem, itemPath, nextItem, sortNewestFirst, visibleItems } from './items.ts'

const dated = (dates: string[]) => dates.map((date) => ({ date }))

const piece = (id: string, extra: Partial<Item> = {}): Item => ({
  kind: 'work',
  id,
  date: '2025',
  title: id,
  color: '#1f3cff',
  headline: '',
  impact: [],
  role: '',
  period: '',
  summary: '',
  ...extra,
})

describe('sortNewestFirst', () => {
  it('orders months and years newest first', () => {
    const sorted = sortNewestFirst(dated(['2024-06', '2026-03', '2025', '2026-10']))
    expect(sorted.map((i) => i.date)).toEqual(['2026-10', '2026-03', '2025', '2024-06'])
  })

  it('sorts a year-only date after any dated month of the same year', () => {
    const sorted = sortNewestFirst(dated(['2025', '2025-06']))
    expect(sorted.map((i) => i.date)).toEqual(['2025-06', '2025'])
  })

  it('keeps file order for ties and does not mutate its input', () => {
    const input = [
      { id: 'a', date: '2025-06' },
      { id: 'b', date: '2025-06' },
    ]
    const sorted = sortNewestFirst(input)
    expect(sorted.map((i) => i.id)).toEqual(['a', 'b'])
    expect(sorted).not.toBe(input)
    expect(input.map((i) => i.id)).toEqual(['a', 'b'])
  })
})

describe('visibleItems', () => {
  const items = [{ id: 'live' }, { id: 'wip', draft: true }]

  it('drops drafts when includeDrafts is false', () => {
    expect(visibleItems(items, { includeDrafts: false }).map((i) => i.id)).toEqual(['live'])
  })

  it('keeps everything when includeDrafts is true', () => {
    expect(visibleItems(items, { includeDrafts: true }).map((i) => i.id)).toEqual(['live', 'wip'])
  })
})

describe('itemPath', () => {
  it('builds the work detail path', () => {
    expect(itemPath({ kind: 'work', id: 'dialpad' })).toBe('/work/dialpad')
  })
})

describe('findItem', () => {
  const items = [piece('dialpad'), piece('other')]

  it('finds an item by kind and id', () => {
    expect(findItem(items, 'work', 'dialpad')?.id).toBe('dialpad')
  })

  it('returns undefined for an unknown id', () => {
    expect(findItem(items, 'work', 'nope')).toBeUndefined()
  })
})

describe('nextItem', () => {
  const items = [piece('a'), piece('b'), piece('c')]

  it('returns the following item', () => {
    expect(nextItem(items, 'a')?.id).toBe('b')
  })

  it('wraps from the last item to the first', () => {
    expect(nextItem(items, 'c')?.id).toBe('a')
  })

  it('returns undefined for a single-item list', () => {
    expect(nextItem([piece('a')], 'a')).toBeUndefined()
  })

  it('returns undefined for an unknown id', () => {
    expect(nextItem(items, 'zzz')).toBeUndefined()
  })
})
