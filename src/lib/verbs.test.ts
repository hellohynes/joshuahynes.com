import { describe, expect, it } from 'vitest'
import { contrastRatio } from './color.ts'
import { FLIP_COLORS, FLIP_FONTS, colorFor, createVerbPicker, type VerbPick } from './verbs.ts'

// Seeded generator so every run draws the same sequence.
function mulberry32(seed: number): () => number {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const VERBS = ['Building', 'Spelunking', 'Deep diving', 'Tinkering', 'Sketching', 'Weaving', 'Mapping', 'Pruning']

const draw = (verbs: readonly string[], count: number, seed = 1): VerbPick[] => {
  const picker = createVerbPicker(verbs, mulberry32(seed))
  return Array.from({ length: count }, () => picker.next())
}

describe('createVerbPicker', () => {
  it('starts with the first verb in the default font and colour', () => {
    expect(draw(VERBS, 1)[0]).toEqual({ verb: 'Building', font: null, color: null })
  })

  it('shows every other verb exactly once before the first repeat', () => {
    const picks = draw(VERBS, VERBS.length)
    expect(picks.slice(1).map((p) => p.verb).sort()).toEqual(VERBS.slice(1).sort())
  })

  it('never shows the same verb twice in a row, across bag boundaries', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const picks = draw(VERBS, 600, seed)
      for (let i = 1; i < picks.length; i++) expect(picks[i].verb).not.toBe(picks[i - 1].verb)
    }
  })

  it('shows each verb about equally often over a long run', () => {
    const counts = new Map<string, number>()
    for (const { verb } of draw(VERBS, 801)) counts.set(verb, (counts.get(verb) ?? 0) + 1)
    for (const verb of VERBS) expect(counts.get(verb)).toBeGreaterThanOrEqual(100)
  })

  it('never repeats a non-default font or colour back to back', () => {
    const picks = draw(VERBS, 600)
    for (let i = 1; i < picks.length; i++) {
      if (picks[i].font !== null) expect(picks[i].font).not.toBe(picks[i - 1].font)
      if (picks[i].color !== null) expect(picks[i].color).not.toBe(picks[i - 1].color)
    }
  })

  it('only picks fonts and colours from the lists', () => {
    const fonts = new Set(FLIP_FONTS.map((f) => f.key))
    const colors = new Set(FLIP_COLORS.map((c) => c.key))
    for (const { font, color } of draw(VERBS, 600)) {
      if (font !== null) expect(fonts.has(font)).toBe(true)
      if (color !== null) expect(colors.has(color)).toBe(true)
    }
  })

  it('keeps the default font about 30% of the time and the default colour about 10%', () => {
    const picks = draw(VERBS, 3000).slice(1)
    const noFont = picks.filter((p) => p.font === null).length / picks.length
    const noColor = picks.filter((p) => p.color === null).length / picks.length
    expect(noFont).toBeGreaterThan(0.2)
    expect(noFont).toBeLessThan(0.4)
    expect(noColor).toBeGreaterThan(0.03)
    expect(noColor).toBeLessThan(0.2)
  })

  it('returns the only verb every time when there is just one', () => {
    expect(draw(['Building'], 20).every((p) => p.verb === 'Building')).toBe(true)
  })

  it('alternates between two verbs', () => {
    expect(draw(['A', 'B'], 7).map((p) => p.verb)).toEqual(['A', 'B', 'A', 'B', 'A', 'B', 'A'])
  })
})

describe('FLIP_FONTS', () => {
  it('has 6 to 8 uniquely keyed typefaces, each with a generic fallback', () => {
    expect(FLIP_FONTS.length).toBeGreaterThanOrEqual(6)
    expect(FLIP_FONTS.length).toBeLessThanOrEqual(8)
    expect(new Set(FLIP_FONTS.map((f) => f.key)).size).toBe(FLIP_FONTS.length)
    for (const { family } of FLIP_FONTS) expect(family).toMatch(/,\s*(serif|sans-serif|monospace|cursive|fantasy)$/)
  })
})

describe('FLIP_COLORS', () => {
  it('has the five named colours', () => {
    expect(FLIP_COLORS.map((c) => c.key)).toEqual(['cobalt', 'orange', 'green', 'purple', 'pink'])
  })

  it.each(FLIP_COLORS)('$key reaches 3:1 on white (light) and on the dark page (dark)', ({ light, dark }) => {
    expect(contrastRatio(light, '#ffffff')).toBeGreaterThanOrEqual(3)
    expect(contrastRatio(dark, '#0e0e0d')).toBeGreaterThanOrEqual(3)
  })
})

describe('colorFor', () => {
  it.each(FLIP_COLORS)('gives $key its light and dark hex', ({ key, light, dark }) => {
    expect(colorFor(key, 'light')).toBe(light)
    expect(colorFor(key, 'dark')).toBe(dark)
  })

  it('is null for the default colour', () => {
    expect(colorFor(null, 'light')).toBeNull()
    expect(colorFor(null, 'dark')).toBeNull()
  })

  it('is null for a key that is not in the list', () => {
    expect(colorFor('teal', 'light')).toBeNull()
    expect(colorFor('', 'dark')).toBeNull()
  })
})
