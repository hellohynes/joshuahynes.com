// Text for the drawing's readout and totals line. Pure: no DOM, React or Vite imports.
import type { summarize } from './activity.ts'

const numbers = new Intl.NumberFormat('en-US')
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export const formatNumber = (n: number): string => numbers.format(n)
export const count = (n: number, noun: string): string => `${numbers.format(n)} ${noun}${n === 1 ? '' : 's'}`

// Dates are `YYYY-MM-DD`; building them in UTC and reading them back in UTC keeps the day from shifting with the time zone.
const utc = (date: string, addDays: number): Date => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + addDays))
}

/** `Apr 13`, optionally `addDays` after `date`. */
export function monthDay(date: string, addDays = 0): string {
  const d = utc(date, addDays)
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}`
}

/** `Apr 13, 2025`, optionally `addDays` after `date`. */
export function withYear(date: string, addDays = 0): string {
  return `${monthDay(date, addDays)}, ${utc(date, addDays).getUTCFullYear()}`
}

/**
 * The figures behind the drawing as one line: the window start, the totals, the documents clause (only when
 * there is documents data) and the snapshot date. `documentsSince` is the first day documents were counted.
 */
export function totalsLine(args: {
  summary: ReturnType<typeof summarize>
  documentsSince: string
  generated: string
}): string {
  const { summary, documentsSince, generated } = args
  const parts = [count(summary.contributions, 'contribution'), count(summary.prs, 'pull request')]
  if (summary.documentsSince !== null) {
    parts.push(`${count(summary.documents, 'document')} written with AI agents since ${withYear(documentsSince)}`)
  }
  parts.push(`updated ${withYear(generated)}`)
  return `Since ${withYear(summary.since)}: ${parts.join(' · ')}`
}
