// Seams for three balls, as curves on a unit sphere (a prolate spheroid for the football),
// rotated and projected to 2D. Only the half facing the viewer is drawn, so spinning the
// ball moves the seams across it like the real thing.

export type BallKind = 'baseball' | 'basketball' | 'football'
type V3 = [number, number, number]

const TAU = Math.PI * 2

const rotX = ([x, y, z]: V3, a: number): V3 => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
const rotY = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
const rotZ = ([x, y, z]: V3, a: number): V3 => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]

const unit = ([x, y, z]: V3): V3 => {
  const n = Math.hypot(x, y, z) || 1
  return [x / n, y / n, z / n]
}
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const along = (steps: number, point: (u: number) => V3) => Array.from({ length: steps + 1 }, (_, i) => point((i / steps) * TAU))

/** The visible runs of a curve, as one SVG path (screen y points down). */
function toPath(points: V3[]) {
  let d = ''
  let pen = false
  for (const [x, y, z] of points) {
    if (z > 0) {
      d += `${pen ? 'L' : 'M'}${x.toFixed(3)} ${(-y).toFixed(3)}`
      pen = true
    } else {
      pen = false
    }
  }
  return d
}

/** Short ticks across a curve (stitches, laces): each is a pair of points either side of it. */
function ticks(curve: V3[], every: number, half: number, view: (p: V3) => V3) {
  let d = ''
  for (let i = 0; i + 1 < curve.length; i += every) {
    const p = curve[i]
    const tangent: V3 = [curve[i + 1][0] - p[0], curve[i + 1][1] - p[1], curve[i + 1][2] - p[2]]
    const side = unit(cross(tangent, p))
    const a = view(unit([p[0] + side[0] * half, p[1] + side[1] * half, p[2] + side[2] * half]))
    const b = view(unit([p[0] - side[0] * half, p[1] - side[1] * half, p[2] - side[2] * half]))
    if (a[2] > 0.3 && b[2] > 0.3) d += `M${a[0].toFixed(3)} ${(-a[1]).toFixed(3)}L${b[0].toFixed(3)} ${(-b[1]).toFixed(3)}`
  }
  return d
}

export interface BallPaths {
  /** the seams */
  seams: string
  /** stitches (baseball) or laces (football) */
  detail: string
}

// Baseball: a seam that weaves up and down the sphere twice (the classic two-lobe curve).
const BASEBALL = along(180, (t): V3 => {
  const lat = 0.82 * Math.sin(2 * t)
  return [Math.cos(lat) * Math.cos(t), Math.sin(lat), Math.cos(lat) * Math.sin(t)]
})

// Basketball: the equator, the meridian, and a pair of curved side seams.
const SIDE_NORMALS: V3[] = [unit([-0.72, 0, 0.69]), unit([0.72, 0, 0.69])]
const smallCircle = (normal: V3, offset: number, u: number): V3 => {
  const a = unit(cross(normal, [0, 1, 0]))
  const b = cross(normal, a)
  const r = Math.sqrt(1 - offset * offset)
  return [
    normal[0] * offset + r * (a[0] * Math.cos(u) + b[0] * Math.sin(u)),
    normal[1] * offset + r * (a[1] * Math.cos(u) + b[1] * Math.sin(u)),
    normal[2] * offset + r * (a[2] * Math.cos(u) + b[2] * Math.sin(u)),
  ]
}
const BASKETBALL = [
  along(120, (u): V3 => [Math.cos(u), 0, Math.sin(u)]),
  along(120, (u): V3 => [0, Math.cos(u), Math.sin(u)]),
  ...SIDE_NORMALS.map((n) => along(120, (u) => smallCircle(n, 0.42, u))),
]

// Football: a prolate spheroid spun about its long (x) axis. Two bands near the tips and laces on top.
const SEMI = { long: 1, short: 0.62 }
const spheroid = (x: number, phi: number): V3 => {
  const r = SEMI.short * Math.sqrt(Math.max(0, 1 - (x / SEMI.long) ** 2))
  return [x, r * Math.cos(phi), r * Math.sin(phi)]
}
const BANDS = [-0.6, 0.6].map((x) => along(90, (u) => spheroid(x, u)))
const LACES = Array.from({ length: 41 }, (_, i): V3 => spheroid(-0.42 + (0.84 * i) / 40, Math.PI / 2))

export const FOOTBALL_TILT = (30 * Math.PI) / 180

export function ballPaths(kind: BallKind, spin: number, tilt = 0.3): BallPaths {
  if (kind === 'football') {
    const view = (p: V3) => rotZ(rotX(p, spin), FOOTBALL_TILT)
    const laceRoot = LACES.map(view)
    // Lace ticks run across the line of laces, on the surface of the spheroid.
    let rungs = ''
    for (let i = 3; i < LACES.length - 3; i += 5) {
      const p = LACES[i]
      const a = view(spheroid(p[0], Math.PI / 2 - 0.2))
      const b = view(spheroid(p[0], Math.PI / 2 + 0.2))
      if (a[2] > 0 && b[2] > 0) rungs += `M${a[0].toFixed(3)} ${(-a[1]).toFixed(3)}L${b[0].toFixed(3)} ${(-b[1]).toFixed(3)}`
    }
    return { seams: BANDS.map((band) => toPath(band.map(view))).join(''), detail: toPath(laceRoot) + rungs }
  }

  const view = (p: V3) => rotZ(rotX(rotY(p, spin), tilt), -0.25)
  if (kind === 'baseball') return { seams: toPath(BASEBALL.map(view)), detail: ticks(BASEBALL, 5, 0.075, view) }
  return { seams: BASKETBALL.map((curve) => toPath(curve.map(view))).join(''), detail: '' }
}
