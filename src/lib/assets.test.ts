import { describe, expect, it } from 'vitest'
import { assetUrl } from './assets.ts'

describe('assetUrl', () => {
  it('keeps a root-absolute path at the site root', () => {
    expect(assetUrl('/work/a.jpg', '/')).toBe('/work/a.jpg')
  })

  it('prefixes a root-absolute path with the base', () => {
    expect(assetUrl('/work/a.jpg', '/12/')).toBe('/12/work/a.jpg')
  })

  it('leaves absolute URLs and data URIs alone', () => {
    expect(assetUrl('https://example.com/a.jpg', '/12/')).toBe('https://example.com/a.jpg')
    expect(assetUrl('data:image/png;base64,AAAA', '/12/')).toBe('data:image/png;base64,AAAA')
  })

  it('leaves relative paths alone', () => {
    expect(assetUrl('work/a.jpg', '/12/')).toBe('work/a.jpg')
  })
})
