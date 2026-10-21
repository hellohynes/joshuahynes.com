// Pure content checks, loaded by both the app's tests and scripts/check-content.mjs (Node): no Vite or React imports.
import type { Item, Site } from '../content/types.ts'

const ID = /^[a-z0-9]+(-[a-z0-9]+)*$/
const DATE = /^\d{4}(-(0[1-9]|1[0-2]))?$/
const COLOR = /^#[0-9a-fA-F]{6}$/
const PLACEHOLDER = /^\s*TODO:/

/** Every string inside a value, with its path, e.g. `story[1]` or `credits[0].name`. */
function* strings(value: unknown, path: string): Generator<[string, string]> {
  if (typeof value === 'string') yield [path, value]
  else if (Array.isArray(value)) for (const [i, v] of value.entries()) yield* strings(v, `${path}[${i}]`)
  else if (value && typeof value === 'object')
    for (const [k, v] of Object.entries(value)) yield* strings(v, path ? `${path}.${k}` : k)
}

function placeholders(value: unknown, label: string): string[] {
  const out: string[] = []
  for (const [path, text] of strings(value, '')) if (PLACEHOLDER.test(text)) out.push(`${label}: ${path} is a TODO placeholder`)
  return out
}

export function validateItems(items: readonly Item[]): string[] {
  const problems: string[] = []
  const seen = new Set<string>()
  const reported = new Set<string>()

  for (const item of items) {
    const id = item.id
    if (!ID.test(id)) problems.push(`${id}: id must be kebab-case (lowercase letters, digits, hyphens)`)
    if (seen.has(id) && !reported.has(id)) {
      problems.push(`${id}: duplicate id`)
      reported.add(id)
    }
    seen.add(id)

    for (const field of ['title', 'headline', 'role', 'period', 'summary'] as const) {
      if (!item[field].trim()) problems.push(`${id}: ${field} is empty`)
    }
    if (!DATE.test(item.date)) problems.push(`${id}: date "${item.date}" must be YYYY or YYYY-MM`)
    if (!COLOR.test(item.color)) problems.push(`${id}: color "${item.color}" must be #rrggbb`)
    if (item.impact.length < 1 || item.impact.length > 3) {
      problems.push(`${id}: impact has ${item.impact.length} entries, needs 1 to 3`)
    }

    if (!item.draft) problems.push(...placeholders(item, id))
  }
  return problems
}

const MAX_VERB_LENGTH = 16

function validateHeadline(headline: Site['headline']): string[] {
  const problems: string[] = []
  for (const field of ['first', 'rest'] as const) {
    if (!headline[field].trim()) problems.push(`site: headline.${field} is empty`)
  }
  if (headline.verbs.length === 0) problems.push('site: headline.verbs is empty')
  const seen = new Set<string>()
  const reported = new Set<string>()
  for (const [i, verb] of headline.verbs.entries()) {
    if (!verb.trim()) {
      problems.push(`site: headline.verbs[${i}] is blank`)
      continue
    }
    if (verb.length > MAX_VERB_LENGTH) {
      problems.push(`site: headline.verbs[${i}] "${verb}" is longer than ${MAX_VERB_LENGTH} characters`)
    }
    const key = verb.toLowerCase()
    if (seen.has(key) && !reported.has(key)) {
      problems.push(`site: headline.verbs[${i}] "${verb}" is a duplicate`)
      reported.add(key)
    }
    seen.add(key)
  }
  return problems
}

export function validateSite(site: Site): string[] {
  const problems: string[] = []
  for (const field of ['name', 'role'] as const) {
    if (!site[field].trim()) problems.push(`site: ${field} is empty`)
  }
  problems.push(...validateHeadline(site.headline))
  if (site.intro.length === 0) problems.push('site: intro is empty')
  if (site.history.length === 0) problems.push('site: history is empty')
  if (!site.contact.email.trim()) problems.push('site: contact.email is empty')
  problems.push(...placeholders(site, 'site'))
  return problems
}
