// Picks the next word for the rotating headline and the typeface and colour it prints in. Pure: all randomness
// comes from the injected `rng` (a function returning [0, 1)), so tests are deterministic.

/** Non-grotesque display faces, each with a different personality. `family` is a CSS font-family value. */
export const FLIP_FONTS: readonly { key: string; family: string }[] = [
  { key: 'instrument-serif', family: '"Instrument Serif", Georgia, serif' },
  { key: 'fraunces', family: '"Fraunces", Georgia, serif' },
  { key: 'dm-serif-display', family: '"DM Serif Display", Georgia, serif' },
  { key: 'yellowtail', family: '"Yellowtail", cursive' },
  { key: 'jetbrains-mono', family: '"JetBrains Mono Variable", ui-monospace, monospace' },
  { key: 'permanent-marker', family: '"Permanent Marker", cursive' },
  { key: 'bungee', family: '"Bungee", Impact, sans-serif' },
  { key: 'silkscreen', family: '"Silkscreen", ui-monospace, monospace' },
]

/** Accent colours for the changing word, each at least 3:1 (large text) on its page background. */
export const FLIP_COLORS: readonly { key: string; light: string; dark: string }[] = [
  { key: 'cobalt', light: '#1f3cff', dark: '#7f93ff' },
  { key: 'orange', light: '#ea4a1f', dark: '#ff8a63' },
  { key: 'green', light: '#1f5a3a', dark: '#4fd08a' },
  { key: 'purple', light: '#5b21b6', dark: '#b69cff' },
  { key: 'pink', light: '#d4247c', dark: '#ff7ab8' },
]

/** `font` and `color` are keys into the lists above; null means the default grotesque / default ink. */
export type VerbPick = { verb: string; font: string | null; color: string | null }

const FONT_DEFAULT_CHANCE = 0.3
const COLOR_DEFAULT_CHANCE = 0.1

function shuffle<T>(items: readonly T[], rng: () => number): T[] {
  const out = [...items]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

/** A random key, or null with probability `nullChance`; never the previous key when that was non-null. */
function pickKey(keys: readonly string[], previous: string | null, nullChance: number, rng: () => number): string | null {
  if (rng() < nullChance) return null
  const options = keys.filter((key) => key !== previous)
  return options[Math.floor(rng() * options.length)]
}

/**
 * First call returns `verbs[0]` in the defaults. After that, a shuffle bag: every verb comes up once before any
 * repeats, and the same verb never shows twice in a row, including when the bag refills.
 */
export function createVerbPicker(verbs: readonly string[], rng: () => number): { next(): VerbPick } {
  const fontKeys = FLIP_FONTS.map((f) => f.key)
  const colorKeys = FLIP_COLORS.map((c) => c.key)
  let bag: string[] = []
  let last: string | null = null
  let font: string | null = null
  let color: string | null = null

  function nextVerb(): string {
    if (last === null) return verbs[0]
    if (bag.length === 0) {
      bag = shuffle(verbs, rng)
      if (verbs.length > 1 && bag[0] === last) {
        const swap = 1 + Math.floor(rng() * (bag.length - 1))
        ;[bag[0], bag[swap]] = [bag[swap], bag[0]]
      }
    }
    return bag.shift() as string
  }

  return {
    next() {
      const first = last === null
      if (first) bag = shuffle(verbs.slice(1), rng)
      const verb = nextVerb()
      last = verb
      if (!first) {
        font = pickKey(fontKeys, font, FONT_DEFAULT_CHANCE, rng)
        color = pickKey(colorKeys, color, COLOR_DEFAULT_CHANCE, rng)
      }
      return { verb, font, color }
    },
  }
}
