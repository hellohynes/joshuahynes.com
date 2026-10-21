import { describe, expect, it } from 'vitest'
import type { Item } from '../src/content/types.ts'
import { routePaths } from './route-html.ts'

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
