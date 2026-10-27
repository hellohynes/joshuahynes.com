// Conventional Commit checks for commit messages, PR titles and branch names. It has no dependencies, so the git
// hooks and CI run it without an install. The types match the pr-create and project-start skills.
//   node scripts/check-format.mjs commit-msg <file>   a commit message file (the commit-msg hook)
//   node scripts/check-format.mjs title <text>        a PR title
//   node scripts/check-format.mjs branch [name]       a branch name; the current branch when omitted
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

export const TYPES = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert']

const HEADER_MAX = 100
const HEADER = /^(?<type>[a-z]+)(?:\((?<scope>[a-z0-9._/-]+)\))?!?: (?<description>\S.*)$/
// Headers that git writes itself, which the author does not choose.
const GIT_HEADER = /^(Merge |Revert "|(fixup|squash|amend)! )/
const BRANCH = /^(?<type>[a-z]+)\/[a-z0-9]+(?:-[a-z0-9]+)*$/
const BRANCH_EXEMPT = /^(main|master|gh-pages|HEAD|(dependabot|renovate)\/.+)$/
const AI_ATTRIBUTION = [
  /^co-authored-by:.*\b(claude|anthropic|codex|openai|copilot|chatgpt)\b/im,
  /generated (with|by) .*\b(claude|codex|copilot|chatgpt)\b/i,
  /\u{1F916}/u,
]

function validateHeader(header) {
  const match = HEADER.exec(header)
  if (!match) return ['The header must look like `type: description` or `type(scope): description`, with a lowercase type.']
  const problems = []
  const { type, description } = match.groups
  if (!TYPES.includes(type)) problems.push(`Unknown type "${type}"; use one of: ${TYPES.join(', ')}.`)
  if (description.endsWith('.')) problems.push('The description must not end with a period.')
  if (header.length > HEADER_MAX) problems.push(`The header is ${header.length} characters; keep it to ${HEADER_MAX} or fewer.`)
  return problems
}

export function validateTitle(title) {
  return validateHeader(title.trim())
}

export function validateCommitMessage(text) {
  const lines = text.split('\n').filter((line) => !line.startsWith('#'))
  while (lines.length > 0 && lines[0].trim() === '') lines.shift()
  if (lines.length === 0) return ['The message is empty.']

  const problems = GIT_HEADER.test(lines[0]) ? [] : validateHeader(lines[0])
  if (lines.length > 1 && lines[1].trim() !== '') problems.push('Leave a blank line between the header and the body.')
  if (AI_ATTRIBUTION.some((pattern) => pattern.test(lines.join('\n')))) {
    problems.push('No AI attribution in a commit message (a Co-Authored-By trailer or a "generated with" line).')
  }
  return problems
}

export function validateBranch(name) {
  if (BRANCH_EXEMPT.test(name)) return []
  const match = BRANCH.exec(name)
  if (match && TYPES.includes(match.groups.type)) return []
  return [`The branch "${name}" must look like type/short-kebab-slug (lowercase, hyphens), with type one of: ${TYPES.join(', ')}.`]
}

function currentBranch() {
  try {
    return execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
  } catch {
    return 'HEAD' // no commits yet, or not a git checkout: nothing to check
  }
}

function main([command, ...args]) {
  let problems
  if (command === 'commit-msg' && args[0]) problems = validateCommitMessage(readFileSync(args[0], 'utf8'))
  else if (command === 'title' && args.length > 0) problems = validateTitle(args.join(' '))
  else if (command === 'branch') problems = validateBranch(args[0] ?? currentBranch())
  else {
    console.error('usage: check-format.mjs commit-msg <file> | title <text> | branch [name]')
    return 2
  }
  if (problems.length === 0) return 0
  console.error(`format check: ${problems.length} problem(s)`)
  for (const problem of problems) console.error(`  ${problem}`)
  return 1
}

if (process.argv[1] === fileURLToPath(import.meta.url)) process.exit(main(process.argv.slice(2)))
