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
 * The figures behind the drawing as two sentences and the snapshot date: the window's totals, the documents
 * (only when there is documents data, counted from `documentsSince`), and when the data was generated.
 */
export function totalsLine(args: {
  summary: ReturnType<typeof summarize>
  weeks: number
  documentsSince: string
  generated: string
}): string {
  const { summary, weeks, documentsSince, generated } = args
  const sentences = [
    `Last ${count(weeks, 'week')}, from ${withYear(summary.since)}: ${count(summary.contributions, 'contribution')} · ${count(summary.prs, 'pull request')}.`,
  ]
  if (summary.documentsSince !== null) {
    sentences.push(`Since ${withYear(documentsSince)}: ${count(summary.documents, 'document')} written with AI agents.`)
  }
  sentences.push(`Updated ${withYear(generated)}.`)
  return sentences.join(' ')
}
