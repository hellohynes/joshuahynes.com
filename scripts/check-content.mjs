// Fails when content is invalid or a published item or the site still holds "TODO:" placeholders,
// so they cannot ship to production. Node loads the .ts modules directly (type stripping).
import { allItems } from '../src/content/items.ts'
import { site } from '../src/content/site.ts'
import { validateItems, validateSite } from '../src/lib/validate.ts'

const problems = [...validateItems(allItems), ...validateSite(site)]

if (problems.length > 0) {
  console.error(`content check: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  ${problem}`)
  process.exit(1)
}
console.log('content check: ok')
