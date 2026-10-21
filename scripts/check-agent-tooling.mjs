// Fails when the Claude and Codex layers of the agent tooling drift apart. Canonical skills live in
// .agents/skills; Pilot syncs a byte-identical copy to .claude/skills. Each agent has shared instructions in
// .agents/agents plus a Claude and a Codex profile with the same name and sandbox capability.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const READ_ONLY_TOOLS = new Set(['Read', 'Grep', 'Glob'])

const read = (path) => readFileSync(path, 'utf8')
const subdirs = (path) =>
  existsSync(path) ? readdirSync(path, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []
const files = (path, ext) => (existsSync(path) ? readdirSync(path).filter((f) => f.endsWith(ext)) : [])

function frontmatter(text) {
  const block = /^---\n([\s\S]*?)\n---/.exec(text)?.[1] ?? ''
  return Object.fromEntries(
    block.split('\n').flatMap((line) => {
      const match = /^([\w-]+):\s*(.*)$/.exec(line)
      return match ? [[match[1], match[2].trim()]] : []
    }),
  )
}

function checkSkills(root, problems) {
  const canonical = subdirs(join(root, '.agents/skills'))
  for (const name of canonical) {
    const source = join(root, '.agents/skills', name, 'SKILL.md')
    if (!existsSync(source)) {
      problems.push(`skill ${name}: .agents/skills/${name}/SKILL.md is missing`)
      continue
    }
    const meta = frontmatter(read(source))
    if (meta.name !== name) problems.push(`skill ${name}: frontmatter name is "${meta.name ?? ''}", expected "${name}"`)
    if (!meta.description) problems.push(`skill ${name}: frontmatter description is empty`)

    const copy = join(root, '.claude/skills', name, 'SKILL.md')
    if (!existsSync(copy)) problems.push(`skill ${name}: .claude/skills/${name}/SKILL.md is missing`)
    else if (read(copy) !== read(source)) problems.push(`skill ${name}: .claude copy differs from the canonical skill`)
  }
  for (const name of subdirs(join(root, '.claude/skills'))) {
    if (!canonical.includes(name)) problems.push(`skill ${name}: .claude/skills/${name} has no canonical skill in .agents/skills`)
  }
}

function checkAgents(root, problems) {
  const shared = files(join(root, '.agents/agents'), '.md').map((f) => f.slice(0, -3))
  for (const name of shared) {
    const sharedPath = `.agents/agents/${name}.md`
    const claudePath = `.claude/agents/${name}.md`
    const codexPath = `.codex/agents/${name}.toml`
    let claudeCapability
    let codexCapability

    if (!existsSync(join(root, claudePath))) problems.push(`agent ${name}: ${claudePath} is missing`)
    else {
      const text = read(join(root, claudePath))
      const meta = frontmatter(text)
      if (meta.name !== name) problems.push(`agent ${name}: ${claudePath} name is "${meta.name ?? ''}"`)
      if (!text.includes(sharedPath)) problems.push(`agent ${name}: ${claudePath} does not load ${sharedPath}`)
      const tools = meta.tools?.split(',').map((t) => t.trim()).filter(Boolean)
      claudeCapability = tools?.length && tools.every((t) => READ_ONLY_TOOLS.has(t)) ? 'read-only' : 'writable'
    }

    if (!existsSync(join(root, codexPath))) problems.push(`agent ${name}: ${codexPath} is missing`)
    else {
      const text = read(join(root, codexPath))
      if (!new RegExp(`^name = "${name}"$`, 'm').test(text)) problems.push(`agent ${name}: ${codexPath} name is not "${name}"`)
      if (!text.includes(sharedPath)) problems.push(`agent ${name}: ${codexPath} does not load ${sharedPath}`)
      const sandbox = /^sandbox_mode = "([^"]*)"$/m.exec(text)?.[1]
      if (sandbox === 'read-only') codexCapability = 'read-only'
      else if (sandbox === 'workspace-write') codexCapability = 'writable'
      else problems.push(`agent ${name}: ${codexPath} sandbox_mode is "${sandbox ?? ''}"`)
    }

    if (claudeCapability && codexCapability && claudeCapability !== codexCapability) {
      problems.push(`agent ${name}: Claude profile is ${claudeCapability} but Codex profile is ${codexCapability}`)
    }
  }
  for (const [dir, ext] of [['.claude/agents', '.md'], ['.codex/agents', '.toml']]) {
    for (const file of files(join(root, dir), ext)) {
      const name = file.slice(0, -ext.length)
      if (!shared.includes(name)) problems.push(`agent ${name}: ${dir}/${file} has no shared .agents/agents/${name}.md`)
    }
  }
}

export function checkAgentTooling(root) {
  const problems = []
  checkSkills(root, problems)
  checkAgents(root, problems)
  return problems
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const problems = checkAgentTooling(fileURLToPath(new URL('..', import.meta.url)))
  if (problems.length > 0) {
    console.error(`agent tooling check: ${problems.length} problem(s)`)
    for (const problem of problems) console.error(`  ${problem}`)
    process.exit(1)
  }
  console.log('agent tooling check: ok')
}
