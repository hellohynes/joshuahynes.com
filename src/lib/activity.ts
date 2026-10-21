// Weekly activity aggregation. Pure, and also imported by scripts/update-activity.mjs under Node, so it
// takes no React, Vite or DOM imports. Dates are `YYYY-MM-DD` and all arithmetic is UTC so DST cannot
// shift a week boundary.
export type WeekActivity = {
  /** The Sunday that starts the week. */
  start: string
  /** Contribution counts, Sunday first; null for a day that has not happened yet. */
  days: (number | null)[]
  prs: number
  /** Null for weeks before the notes folder existed. */
  documents: number | null
}

const DAY_MS = 86_400_000

const toMs = (date: string): number => Date.parse(`${date}T00:00:00Z`)
const toDate = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

export function weekStart(date: string): string {
  const ms = toMs(date)
  return toDate(ms - new Date(ms).getUTCDay() * DAY_MS)
}

export function buildWeeks(input: {
  dailyCounts: Record<string, number>
  prDates: string[]
  documentDates: string[]
  documentsSince: string
  weeks: number
  today: string
}): WeekActivity[] {
  const { dailyCounts, prDates, documentDates, documentsSince, weeks, today } = input
  const lastStart = toMs(weekStart(today))
  const documentsStart = weekStart(documentsSince)

  const result: WeekActivity[] = Array.from({ length: weeks }, (_, i) => {
    const startMs = lastStart - (weeks - 1 - i) * 7 * DAY_MS
    const start = toDate(startMs)
    const days = Array.from({ length: 7 }, (_, d) => {
      const date = toDate(startMs + d * DAY_MS)
      return date > today ? null : (dailyCounts[date] ?? 0)
    })
    return { start, days, prs: 0, documents: start < documentsStart ? null : 0 }
  })

  const byStart = new Map(result.map((week) => [week.start, week]))
  for (const date of prDates) {
    const week = byStart.get(weekStart(date))
    if (week) week.prs += 1
  }
  for (const date of documentDates) {
    const week = byStart.get(weekStart(date))
    if (week && week.documents !== null) week.documents += 1
  }
  return result
}

export function summarize(weeks: readonly WeekActivity[]): {
  contributions: number
  prs: number
  documents: number
  since: string
  documentsSince: string | null
} {
  let contributions = 0
  let prs = 0
  let documents = 0
  for (const week of weeks) {
    for (const day of week.days) contributions += day ?? 0
    prs += week.prs
    documents += week.documents ?? 0
  }
  return {
    contributions,
    prs,
    documents,
    since: weeks[0]?.start ?? '',
    documentsSince: weeks.find((week) => week.documents !== null)?.start ?? null,
  }
}
