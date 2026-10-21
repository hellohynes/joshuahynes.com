// Refreshes src/data/activity.ts for the account `gh` is signed in as. Run it with `pnpm activity`.
// Only counts and dates are stored and printed: daily contribution counts, pull request creation dates and
// the creation dates of markdown notes. No repository names, titles, file names or note text are read or kept.
import { execFileSync } from 'node:child_process'
import { readdirSync, statSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { buildWeeks, summarize, weekStart } from '../src/lib/activity.ts'

const WEEKS = 80
const DOCUMENTS_SINCE = '2026-02-10'
const DAY_MS = 86_400_000
const RETRIES = 3

const day = (ms) => new Date(ms).toISOString().slice(0, 10)

// Failures carry only a short tag (an HTTP status or an error code). gh's stderr can name the login, an org or
// a resource, so it is never kept, rethrown or printed.
function graphql(query) {
  for (let attempt = 1; ; attempt++) {
    try {
      const out = execFileSync('gh', ['api', 'graphql', '-f', `query=${query}`], {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
        maxBuffer: 64 * 1024 * 1024,
      })
      return JSON.parse(out).data
    } catch (error) {
      const http = /HTTP \d{3}/.exec(String(error.stderr ?? ''))?.[0]
      if (attempt < RETRIES && http?.startsWith('HTTP 5')) continue
      throw Object.assign(new Error('gh failed'), { tag: http ?? 'gh' })
    }
  }
}

function main() {
  const now = Date.now()
  const today = day(now)
  const windowStart = weekStart(day(Date.parse(`${weekStart(today)}T00:00:00Z`) - (WEEKS - 1) * 7 * DAY_MS))

  const { login } = graphql('query { viewer { login } }').viewer

  // contributionsCollection allows at most a one-year span, so the window is two queries. Contribution days
  // follow the GitHub profile's timezone; pull request and document days below are UTC.
  const dailyCounts = {}
  const YEAR_MS = 364 * DAY_MS
  for (const to of [now, now - YEAR_MS]) {
    const from = to - YEAR_MS
    const query = `query { viewer { contributionsCollection(from: "${new Date(from).toISOString()}", to: "${new Date(to).toISOString()}") { contributionCalendar { weeks { contributionDays { date contributionCount } } } } } }`
    const { weeks } = graphql(query).viewer.contributionsCollection.contributionCalendar
    for (const week of weeks) {
      for (const { date, contributionCount } of week.contributionDays) {
        // The two windows share a boundary day that each reports partially; max (not a sum) is deliberate.
        dailyCounts[date] = Math.max(dailyCounts[date] ?? 0, contributionCount)
      }
    }
  }

  // Pull request creation dates, one search per calendar month (a search returns at most 1000 results).
  const prDates = []
  const cursor = new Date(`${windowStart}T00:00:00Z`)
  cursor.setUTCDate(1)
  while (cursor.getTime() <= now) {
    const monthStart = new Date(cursor)
    const monthEnd = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 0))
    const range = `${day(monthStart.getTime())}..${day(monthEnd.getTime())}`
    let after = null
    for (;;) {
      const args = `query: "author:${login} type:pr created:${range}", type: ISSUE, first: 50${after ? `, after: "${after}"` : ''}`
      const { search } = graphql(
        `query { search(${args}) { pageInfo { hasNextPage endCursor } nodes { ... on PullRequest { createdAt } } } }`,
      )
      for (const node of search.nodes) if (node?.createdAt) prDates.push(node.createdAt.slice(0, 10))
      if (!search.pageInfo.hasNextPage) break
      after = search.pageInfo.endCursor
    }
    cursor.setUTCMonth(cursor.getUTCMonth() + 1)
  }

  // Notes: only directory entries and each markdown file's creation time are read, never its content.
  // Documents are dated by birthtime, so a file that was copied or restored dates to when it was copied.
  // A missing or unreadable NOTES_DIR fails the run; anything unreadable below it is skipped silently.
  const notesDir = process.env.NOTES_DIR ?? join(homedir(), 'notes')
  const documentDates = []
  function walk(dir, isRoot) {
    let entries
    try {
      entries = readdirSync(dir, { withFileTypes: true })
    } catch (error) {
      if (isRoot) throw error
      return
    }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (!entry.name.startsWith('.')) walk(join(dir, entry.name), false)
      } else if (entry.isFile() && entry.name.endsWith('.md')) {
        try {
          documentDates.push(day(statSync(join(dir, entry.name)).birthtimeMs))
        } catch {
          // deleted or unreadable mid-walk: skip it
        }
      }
    }
  }
  walk(notesDir, true)

  const weeks = buildWeeks({ dailyCounts, prDates, documentDates, documentsSince: DOCUMENTS_SINCE, weeks: WEEKS, today })
  const totals = summarize(weeks)

  const rows = weeks.map(
    (w) =>
      `  { start: '${w.start}', days: [${w.days.map((d) => d ?? 'null').join(', ')}], prs: ${w.prs}, documents: ${w.documents ?? 'null'} },`,
  )
  writeFileSync(
    new URL('../src/data/activity.ts', import.meta.url),
    `// Generated by scripts/update-activity.mjs, do not edit by hand.
// Aggregate counts only: per day contributions, per week pull requests opened and notes written.
// No repository names, titles, file names or text.
import type { WeekActivity } from '../lib/activity.ts'

export const ACTIVITY_GENERATED = '${today}'
export const DOCUMENTS_SINCE = '${DOCUMENTS_SINCE}'
export const ACTIVITY_WEEKS: WeekActivity[] = [
${rows.join('\n')}
]
`,
  )
  console.log(
    `wrote ${weeks.length} weeks: ${totals.contributions} contributions, ${totals.prs} pull requests, ${totals.documents} documents`,
  )
}

// Only a status or error code is ever printed: messages, stderr, stacks and paths can carry names.
try {
  main()
} catch (error) {
  const raw = error?.tag ?? error?.code
  const tag = typeof raw === 'string' && /^[A-Za-z0-9_ ]{1,16}$/.test(raw) ? raw : 'error'
  console.error(`update-activity failed (${tag})`)
  process.exit(1)
}
