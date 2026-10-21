// A Fenway-shaped park, top-down. Illustrative: the outline follows the
// published 310 / 420 / 302 ft marks, and the hits are generated, not measured.

export const HOME = { x: 200, y: 290 }
const PX_PER_FT = 0.55

/** Wall distance by spray angle: -45 is the left-field line, 45 the right-field line. */
export const WALL: [deg: number, ft: number][] = [
  [-45, 310],
  [-30, 345],
  [-15, 379],
  [0, 420],
  [10, 390],
  [25, 380],
  [38, 330],
  [45, 302],
]

export function wallAt(deg: number) {
  if (deg <= WALL[0][0]) return WALL[0][1]
  for (let i = 1; i < WALL.length; i++) {
    const [d1, f1] = WALL[i]
    if (deg <= d1) {
      const [d0, f0] = WALL[i - 1]
      return f0 + ((f1 - f0) * (deg - d0)) / (d1 - d0)
    }
  }
  return WALL[WALL.length - 1][1]
}

export function toXY(deg: number, ft: number) {
  const rad = (deg * Math.PI) / 180
  return { x: HOME.x + ft * PX_PER_FT * Math.sin(rad), y: HOME.y - ft * PX_PER_FT * Math.cos(rad) }
}

export function fromXY(x: number, y: number) {
  const dx = (x - HOME.x) / PX_PER_FT
  const dy = (HOME.y - y) / PX_PER_FT
  return { ft: Math.hypot(dx, dy), deg: (Math.atan2(dx, dy) * 180) / Math.PI }
}

export type Result = 'foul ball' | 'infield single' | 'single' | 'double' | 'home run'

export function classify(deg: number, ft: number): Result {
  if (Math.abs(deg) > 45) return 'foul ball'
  const wall = wallAt(deg)
  if (ft >= wall) return 'home run'
  if (ft >= wall - 75) return 'double'
  if (ft >= 150) return 'single'
  return 'infield single'
}

function side(deg: number) {
  if (deg <= -30) return 'left field'
  if (deg <= -10) return 'left-center'
  if (deg < 10) return 'center'
  if (deg < 30) return 'right-center'
  return 'right field'
}

/** Title-cased result for the hand-lettered label. */
export const titleCase = (text: string) => text.replace(/\b\w/g, (c) => c.toUpperCase())

export function describe(deg: number, ft: number, result: Result = classify(deg, ft)) {
  return result === 'foul ball' ? result : `${side(deg)} · ${result}`
}

// Small seeded generator so the hits are the same on every load.
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export interface Hit {
  kind: 'single' | 'double' | 'homer'
  x: number
  y: number
}

/** Every hit circle is drawn at this radius, in stage units. */
export const HIT_R = 3.4

export const HITS: Hit[] = (() => {
  const rand = mulberry32(1912)
  const hits: Hit[] = []
  // Bell-shaped spray with a slight pull to left, clamped inside the lines.
  const angle = (pull: number) => {
    const u = (rand() + rand() + rand()) / 3
    return Math.max(-43, Math.min(43, (u - 0.5) * 86 - pull))
  }
  const add = (kind: Hit['kind'], deg: number, ft: number) => {
    const p = toXY(deg, ft)
    hits.push({ kind, x: Math.round(p.x * 10) / 10, y: Math.round(p.y * 10) / 10 })
  }
  // Singles run from the infield out into the gaps, so they overlap the doubles.
  for (let i = 0; i < 52; i++) {
    const deg = angle(5)
    add('single', deg, 55 + (wallAt(deg) - 100) * rand() ** 0.8)
  }
  // Wall-ball singles: played off the Monster in left and held to a single, plus a few in the right-field corner.
  for (let i = 0; i < 14; i++) {
    const deg = -44 + rand() * 30
    add('single', deg, wallAt(deg) - (4 + rand() * 26))
  }
  for (let i = 0; i < 6; i++) {
    const deg = 20 + rand() * 23
    add('single', deg, wallAt(deg) - (4 + rand() * 30))
  }
  for (let i = 0; i < 24; i++) {
    const deg = angle(6)
    add('double', deg, wallAt(deg) - 110 + rand() * 104)
  }
  for (let i = 0; i < 14; i++) {
    const deg = angle(16)
    add('homer', deg, wallAt(deg) + 4 + rand() * 34)
  }
  return hits
})()

/** The topmost hit within `radius` stage units of a point, if any. */
export function nearestHit(x: number, y: number, radius: number): Hit | undefined {
  let best: Hit | undefined
  let bestDistance = radius
  for (const hit of HITS) {
    const distance = Math.hypot(hit.x - x, hit.y - y)
    if (distance <= bestDistance) {
      best = hit
      bestDistance = distance
    }
  }
  return best
}
