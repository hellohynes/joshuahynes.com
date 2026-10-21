// Text for the drawing's readout and the footer stats line. Pure: no DOM, React or Vite imports.
import type { Site } from '../content/types.ts'

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

/** The footer stats as one line: the lead, then the items separated by slashes (just the lead when there are none). */
export function statsLine(stats: Site['stats']): string {
  return [stats.lead, stats.items.join(' / ')].filter(Boolean).join(' ')
}
