import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { checkAgentTooling } from './check-agent-tooling.mjs'

const roots = []

function put(root, path, text) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

const skill = (name) => `---\nname: ${name}\ndescription: Does ${name}.\n---\n\n# ${name}\n`
const claudeAgent = (name, tools) =>
  `---\nname: ${name}\ndescription: ${name} agent.\n${tools ? `tools: ${tools}\n` : ''}---\n\nRead \`.agents/agents/${name}.md\`.\n`
const codexAgent = (name, sandbox) =>
  `name = "${name}"\nsandbox_mode = "${sandbox}"\ndeveloper_instructions = """\nRead \`.agents/agents/${name}.md\`.\n"""\n`

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'agent-tooling-'))
  roots.push(root)
  for (const dir of ['.agents/skills', '.claude/skills']) put(root, `${dir}/shaping/SKILL.md`, skill('shaping'))
  put(root, '.agents/agents/builder.md', '# Builder\n')
  put(root, '.agents/agents/reviewer.md', '# Reviewer\n')
  put(root, '.claude/agents/builder.md', claudeAgent('builder'))
  put(root, '.claude/agents/reviewer.md', claudeAgent('reviewer', 'Read, Grep, Glob'))
  put(root, '.codex/agents/builder.toml', codexAgent('builder', 'workspace-write'))
  put(root, '.codex/agents/reviewer.toml', codexAgent('reviewer', 'read-only'))
  return root
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true })
})

describe('checkAgentTooling', () => {
  it('passes a consistent tree', () => {
    expect(checkAgentTooling(fixture())).toEqual([])
  })

  it('reports a Claude skill copy that drifted and a Claude skill with no canonical one', () => {
    const root = fixture()
    put(root, '.claude/skills/shaping/SKILL.md', `${skill('shaping')}edited\n`)
    put(root, '.claude/skills/stray/SKILL.md', skill('stray'))
    const problems = checkAgentTooling(root).join('\n')
    expect(problems).toMatch(/shaping.*differs from the canonical/)
    expect(problems).toMatch(/stray.*no canonical/)
  })

  it('reports a canonical skill whose frontmatter name does not match its directory', () => {
    const root = fixture()
    put(root, '.agents/skills/shaping/SKILL.md', skill('other'))
    put(root, '.claude/skills/shaping/SKILL.md', skill('other'))
    expect(checkAgentTooling(root).join('\n')).toMatch(/shaping.*name/)
  })

  it('reports agents whose Claude and Codex sandbox capability differ', () => {
    const root = fixture()
    put(root, '.claude/agents/reviewer.md', claudeAgent('reviewer', 'Read, Grep, Glob, Write'))
    expect(checkAgentTooling(root).join('\n')).toMatch(/reviewer.*writable.*read-only/)
  })

  it('reports an agent missing its Codex profile', () => {
    const root = fixture()
    rmSync(join(root, '.codex/agents/builder.toml'))
    expect(checkAgentTooling(root).join('\n')).toMatch(/builder.*\.codex\/agents\/builder\.toml/)
  })
})
