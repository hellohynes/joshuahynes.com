// Fails when src/content.ts still holds "TODO:" placeholders, so they cannot ship to production.
import { readFileSync } from 'node:fs'

const file = new URL('../src/content.ts', import.meta.url)
const lines = readFileSync(file, 'utf8').split('\n')
const hits = lines
  .map((text, i) => ({ line: i + 1, text: text.trim() }))
  .filter(({ text }) => !text.startsWith('//') && /['"`]TODO:/.test(text))

if (hits.length > 0) {
  console.error(`src/content.ts has ${hits.length} placeholder(s) left:`)
  for (const { line, text } of hits) console.error(`  line ${line}: ${text}`)
  process.exit(1)
}
console.log('content check: no placeholders left')
