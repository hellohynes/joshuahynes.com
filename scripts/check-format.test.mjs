import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { TYPES, validateBranch, validateCommitMessage, validateTitle } from './check-format.mjs'

const SCRIPT = new URL('./check-format.mjs', import.meta.url).pathname

describe('validateTitle', () => {
  it.each([
    'feat: add a contact section',
    'fix(about): keep the intro on one line',
    'chore!: drop Node 22',
    'docs: explain the hook',
    'ci: run the gates on every PR',
  ])('accepts %s', (title) => {
    expect(validateTitle(title)).toEqual([])
  })

  it.each([
    ['Add a contact section', /type: description/],
    ['Feat: add a thing', /type: description/],
    ['feature: add a thing', /Unknown type "feature"/],
    ['feat:add a thing', /type: description/],
    ['feat:  ', /type: description/],
    ['feat: ends with a period.', /period/],
    [`feat: ${'x'.repeat(100)}`, /100/],
  ])('rejects %j', (title, message) => {
    expect(validateTitle(title).join('\n')).toMatch(message)
  })

  it('names every allowed type when the type is unknown', () => {
    const problem = validateTitle('wip: something').join('\n')
    for (const type of TYPES) expect(problem).toContain(type)
  })
})

describe('validateCommitMessage', () => {
  it('accepts a header with a body after a blank line', () => {
    expect(validateCommitMessage('fix: stop the drawing flicker\n\nThe canvas resized twice on load.\n')).toEqual([])
  })

  it('ignores comment lines that git adds to the editor message', () => {
    expect(validateCommitMessage('# Please enter a message\nfeat: add a thing\n# more\n')).toEqual([])
  })

  it('rejects a body that follows the header with no blank line', () => {
    expect(validateCommitMessage('feat: add a thing\nthe body starts too soon\n').join('\n')).toMatch(/blank line/)
  })

  it.each(['Merge branch "main" into feat/x', 'Revert "feat: add a thing"', 'fixup! feat: add a thing', 'squash! fix: a'])(
    'lets git generated header %j through',
    (header) => {
      expect(validateCommitMessage(`${header}\n`)).toEqual([])
    },
  )

  it('rejects a non-conventional header', () => {
    expect(validateCommitMessage('updated the readme\n').join('\n')).toMatch(/type: description/)
  })

  it.each([
    'feat: add a thing\n\nCo-Authored-By: Claude <noreply@anthropic.com>\n',
    'feat: add a thing\n\nco-authored-by: Codex <codex@openai.com>\n',
    'feat: add a thing\n\nGenerated with Claude Code\n',
    'feat: add a thing\n\n\u{1F916} Generated with an assistant\n',
  ])('rejects AI attribution in %j', (message) => {
    expect(validateCommitMessage(message).join('\n')).toMatch(/AI attribution/)
  })

  it('keeps a human co-author', () => {
    expect(validateCommitMessage('feat: add a thing\n\nCo-authored-by: Sam Doe <sam@example.com>\n')).toEqual([])
  })

  it('rejects an empty message', () => {
    expect(validateCommitMessage('# only comments\n\n').join('\n')).toMatch(/empty/)
  })
})

describe('validateBranch', () => {
  it.each(['feat/contact-section', 'fix/muted-contrast', 'chore/ci-and-pre-commit', 'docs/x', 'main', 'gh-pages', 'HEAD', 'dependabot/npm_and_yarn/vite-8.4.0'])(
    'accepts %s',
    (branch) => {
      expect(validateBranch(branch)).toEqual([])
    },
  )

  it.each(['Feature/x', 'feat/Under_Score', 'feat/', 'feat', 'my-branch', 'feature/new-thing', 'feat/two--hyphens', 'feat/ends-'])(
    'rejects %s',
    (branch) => {
      expect(validateBranch(branch).join('\n')).toMatch(/type\/short-kebab-slug/)
    },
  )
})

describe('command line', () => {
  const run = (...args) => spawnSync('node', [SCRIPT, ...args], { encoding: 'utf8' })

  it('exits 0 for a valid title and 1 with the problem for an invalid one', () => {
    expect(run('title', 'feat: add a thing').status).toBe(0)
    const bad = run('title', 'added a thing')
    expect(bad.status).toBe(1)
    expect(bad.stderr).toMatch(/type: description/)
  })

  it('reads a commit message from a file', () => {
    const dir = mkdtempSync(join(tmpdir(), 'check-format-'))
    const good = join(dir, 'good')
    const bad = join(dir, 'bad')
    writeFileSync(good, '# comment\nfix: a thing\n')
    writeFileSync(bad, 'a thing\n')
    expect(run('commit-msg', good).status).toBe(0)
    expect(run('commit-msg', bad).status).toBe(1)
  })

  it('checks the branch it is given and the current branch by default', () => {
    expect(run('branch', 'feat/ok').status).toBe(0)
    expect(run('branch', 'BadBranch').status).toBe(1)
    const current = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim()
    expect(run('branch').status).toBe(validateBranch(current).length === 0 ? 0 : 1)
  })

  it('prints usage and exits 2 for an unknown command', () => {
    const result = run('nope')
    expect(result.status).toBe(2)
    expect(result.stderr).toMatch(/usage/i)
  })
})
