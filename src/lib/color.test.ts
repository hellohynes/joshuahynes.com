import { describe, expect, it } from 'vitest'
import { INK, PAPER, contrastRatio, readableText } from './color.ts'

const PALETTE = [
  '#1f3cff',
  '#ea4a1f',
  '#b7a6ff',
  '#cfc8b6',
  '#121110',
  '#f2c92b',
  '#1f5a3a',
  '#f2b3c4',
  '#7fd3c1',
]

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(Math.abs(contrastRatio('#000000', '#ffffff') - 21)).toBeLessThan(0.01)
  })
})

describe('readableText', () => {
  it.each(PALETTE)('reaches 4.5:1 on %s', (colour) => {
    expect(contrastRatio(colour, readableText(colour))).toBeGreaterThanOrEqual(4.5)
  })

  it('picks paper on ink and ink on yellow', () => {
    expect(readableText('#121110')).toBe(PAPER)
    expect(readableText('#f2c92b')).toBe(INK)
  })
})
