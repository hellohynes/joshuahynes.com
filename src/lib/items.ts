import type { Item } from '../content/types.ts'

// A year-only date ("2025") becomes "2025-00" so it sorts after every dated month of that year.
const sortKey = (date: string) => (date.length === 4 ? `${date}-00` : date)

export function sortNewestFirst<T extends { date: string }>(items: readonly T[]): T[] {
  return [...items].sort((a, b) => {
    const ka = sortKey(a.date)
    const kb = sortKey(b.date)
    return ka < kb ? 1 : ka > kb ? -1 : 0
  })
}

export function visibleItems<T extends { draft?: boolean }>(
  items: readonly T[],
  opts: { includeDrafts: boolean },
): T[] {
  return opts.includeDrafts ? [...items] : items.filter((item) => !item.draft)
}

export function itemPath(item: { kind: Item['kind']; id: string }): string {
  return `/work/${item.id}`
}

export function findItem(items: readonly Item[], kind: Item['kind'], id: string): Item | undefined {
  return items.find((item) => item.kind === kind && item.id === id)
}

export function nextItem(items: readonly Item[], id: string): Item | undefined {
  if (items.length < 2) return undefined
  const index = items.findIndex((item) => item.id === id)
  if (index === -1) return undefined
  return items[(index + 1) % items.length]
}
