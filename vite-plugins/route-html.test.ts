import { describe, expect, it } from 'vitest'
import type { Item } from '../src/content/types.ts'
import { routePaths, stripDraftsFromModule } from './route-html.ts'

const item = (id: string, draft?: boolean): Item =>
  ({ kind: 'work', id, date: '2026', title: id, draft }) as unknown as Item

describe('routePaths', () => {
  it('lists the fixed routes plus published item paths, excluding drafts', () => {
    expect(routePaths([item('a'), item('b', true)])).toEqual(['/work', '/about', '/work/a'])
  })

  it('lists only the fixed routes for an empty list', () => {
    expect(routePaths([])).toEqual(['/work', '/about'])
  })
})

describe('stripDraftsFromModule', () => {
  const items = [item('published-piece'), item('draft-piece', true)]

  it('replaces the items module with the published items only', () => {
    const out = stripDraftsFromModule('original source', '/repo/src/content/items.ts?t=1', items)
    expect(out).not.toBeNull()
    expect(out).toContain('published-piece')
    expect(out).not.toContain('draft-piece')
    expect(out).not.toContain('original source')
  })

  it('normalises Windows separators in the module id', () => {
    expect(stripDraftsFromModule('x', 'C:\\repo\\src\\content\\items.ts', items)).toContain('published-piece')
  })

  it('leaves every other module alone', () => {
    expect(stripDraftsFromModule('x', '/repo/src/content/index.ts', items)).toBeNull()
    expect(stripDraftsFromModule('x', '/repo/src/content/items.test.ts', items)).toBeNull()
  })
})
