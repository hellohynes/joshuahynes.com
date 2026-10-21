import { describe, expect, it } from 'vitest'
import { FLIP_TIMING, cellPhase, endCursorVisible, flipDuration } from './flip.ts'

const POOL = 40

describe('cellPhase', () => {
  it('exposes the approved prototype timing', () => {
    expect(FLIP_TIMING).toEqual({ cursorStepMs: 36, cursorLifeMs: 52, tickMs: 70, lockDelayMs: 380, lockStepMs: 45 })
  })

  it.each([
    // index 0: cursor [0, 52), spin until 380, locked from 380
    [0, 0, 'cursor'],
    [51, 0, 'cursor'],
    [52, 0, 'spin'],
    [379, 0, 'spin'],
    [380, 0, 'locked'],
    // index 5: starts at 180, cursor until 232, locks at 380 + 225 = 605
    [179, 5, 'hidden'],
    [180, 5, 'cursor'],
    [231, 5, 'cursor'],
    [232, 5, 'spin'],
    [604, 5, 'spin'],
    [605, 5, 'locked'],
  ] as const)('at %ims cell %i is %s', (t, index, phase) => {
    expect(cellPhase(t, index, POOL).phase).toBe(phase)
  })

  it('is hidden before the print starts at all', () => {
    expect(cellPhase(-1, 0, POOL).phase).toBe('hidden')
  })

  it('keeps the glyph at 0 outside the spin phase', () => {
    expect(cellPhase(10, 0, POOL).glyph).toBe(0)
    expect(cellPhase(1000, 0, POOL).glyph).toBe(0)
    expect(cellPhase(100, 5, POOL).glyph).toBe(0)
  })

  it('picks a glyph in range that changes every tick for a spinning cell', () => {
    const glyphs: number[] = []
    for (let t = 52; t < 380; t += 70) {
      const { phase, glyph } = cellPhase(t, 0, POOL)
      expect(phase).toBe('spin')
      expect(glyph).toBeGreaterThanOrEqual(0)
      expect(glyph).toBeLessThan(POOL)
      glyphs.push(glyph)
    }
    for (let i = 1; i < glyphs.length; i++) expect(glyphs[i]).not.toBe(glyphs[i - 1])
  })

  it('holds the glyph steady within a tick', () => {
    expect(cellPhase(100, 0, POOL).glyph).toBe(cellPhase(139, 0, POOL).glyph)
  })

  it('gives neighbouring spinning cells different glyphs', () => {
    for (let index = 0; index < 6; index++) {
      const a = cellPhase(300, index, POOL)
      const b = cellPhase(300, index + 1, POOL)
      expect(a.phase).toBe('spin')
      expect(b.phase).toBe('spin')
      expect(a.glyph).not.toBe(b.glyph)
    }
  })
})

describe('endCursorVisible', () => {
  // 8 characters: print ends at 288, last lock at 380 + 315 = 695, gone at 1015
  it.each([
    [0, false],
    [287, false],
    [288, true],
    [437, true],
    [438, false],
    [587, false],
    [588, true],
    [737, true],
    [738, false],
    [887, false],
    [888, true],
    [1014, true],
    [1015, false],
    [5000, false],
  ])('at %ims, 8 characters: %s', (t, visible) => {
    expect(endCursorVisible(t, 8)).toBe(visible)
  })

  it('works for one character', () => {
    // print ends at 36, last lock at 380, gone at 700
    expect(endCursorVisible(35, 1)).toBe(false)
    expect(endCursorVisible(36, 1)).toBe(true)
    expect(endCursorVisible(699, 1)).toBe(true) // (699-36)/150 = tick 4, on
    expect(endCursorVisible(700, 1)).toBe(false)
  })
})

describe('flipDuration', () => {
  it('ends 320ms after the last character locks', () => {
    expect(flipDuration(8)).toBe(380 + 7 * 45 + 320)
    expect(flipDuration(1)).toBe(380 + 320)
  })

  it('leaves every cell locked and the end cursor off', () => {
    const end = flipDuration(8)
    for (let i = 0; i < 8; i++) expect(cellPhase(end, i, POOL).phase).toBe('locked')
    expect(endCursorVisible(end, 8)).toBe(false)
  })
})
