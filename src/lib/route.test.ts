import { describe, expect, it } from 'vitest'
import { hrefFor, parseRoute } from './route.ts'

describe('parseRoute with base "/"', () => {
  it.each([
    ['/', { name: 'home' }],
    ['/work', { name: 'work' }],
    ['/work/', { name: 'work' }],
    ['/about', { name: 'about' }],
    ['/work/dialpad', { name: 'piece', kind: 'work', id: 'dialpad' }],
    ['/work/dialpad/', { name: 'piece', kind: 'work', id: 'dialpad' }],
    ['/nope', { name: 'notFound' }],
    ['/work/a/b', { name: 'notFound' }],
    ['/work/%20', { name: 'notFound' }],
  ])('%s', (pathname, expected) => {
    expect(parseRoute(pathname, '/')).toEqual(expected)
  })
})

describe('parseRoute with a preview base "/12/"', () => {
  it.each([
    ['/12/', { name: 'home' }],
    ['/12', { name: 'home' }],
    ['/12/work', { name: 'work' }],
    ['/12/work/dialpad', { name: 'piece', kind: 'work', id: 'dialpad' }],
    ['/work', { name: 'notFound' }],
  ])('%s', (pathname, expected) => {
    expect(parseRoute(pathname, '/12/')).toEqual(expected)
  })
})

describe('hrefFor', () => {
  it('prefixes the base', () => {
    expect(hrefFor('/work/dialpad', '/')).toBe('/work/dialpad')
    expect(hrefFor('/work', '/12/')).toBe('/12/work')
    expect(hrefFor('/', '/12/')).toBe('/12/')
  })

  it('keeps a hash fragment', () => {
    expect(hrefFor('/about#contact', '/12/')).toBe('/12/about#contact')
  })
})
