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
  /** baseball only: the dense double stitching, for the rendered look */
  stitches: string
  /** baseball only: the two edges of the raised seam ribbon */
  rails: string
  /** football only: the centre lines of the two white bands, and the outline of the lace plate */
  bands: string
  plate: string
}

const NO_EXTRAS = { stitches: '', rails: '', bands: '', plate: '' }

// The exact "tennis ball curve", which stays on the unit sphere. With a + b = 1 and c^2 = 4ab the point is
// x = a cos t - b cos 3t, y = c cos 2t, z = a sin t + b sin 3t (y is the axis of the two panels, drawn as "up").
// A larger b pushes the seam further toward the poles.
const tennisCurve = (b: number) => {
  const a = 1 - b
  const c = Math.sqrt(4 * a * b)
  return (t: number): V3 => [a * Math.cos(t) - b * Math.cos(3 * t), c * Math.cos(2 * t), a * Math.sin(t) + b * Math.sin(3 * t)]
}
// Baseball seam: gentle lobes.
const seamPoint = tennisCurve(0.14)
const BASEBALL = along(180, seamPoint)

// A baseball or basketball tumbles: it spins about its own axis while that axis nods and rolls slowly, so the seams
// never trace the same path twice. (Any mix of rotations is still a true orientation of the ball.)
const tumbleView = (spin: number, tilt: number) => (p: V3): V3 =>
  rotZ(rotX(rotY(p, spin), tilt + 0.32 * Math.sin(spin * 0.41)), -0.25 + 0.5 * Math.sin(spin * 0.27 + 1))

// Real stitching: 108 double stitches across a seam ribbon. Each interval of the seam gets two threads that
// cross between the ribbon's rails.
const STITCHES = 108
const RIBBON_HALF = 0.06
const SEAM = along(STITCHES, seamPoint)
const rail = (side: 1 | -1) =>
  SEAM.slice(0, STITCHES).map((p, i): V3 => {
    const q = SEAM[i + 1]
    const n = unit(cross([q[0] - p[0], q[1] - p[1], q[2] - p[2]], p))
    return unit([p[0] + side * RIBBON_HALF * n[0], p[1] + side * RIBBON_HALF * n[1], p[2] + side * RIBBON_HALF * n[2]])
  })
const RAIL_A = rail(1)
const RAIL_B = rail(-1)

const thread = (a: V3, b: V3) =>
  a[2] > 0.28 && b[2] > 0.28 ? `M${a[0].toFixed(3)} ${(-a[1]).toFixed(3)}L${b[0].toFixed(3)} ${(-b[1]).toFixed(3)}` : ''

// Basketball: two great circles at right angles that cross at the poles (the "cross"), and one closed
// seam that winds round the ball between them, crossing each great circle exactly twice. That makes
// eight panels. The winding seam is a tennis-ball curve with deeper lobes (reaching about 65 degrees
// toward the poles), with its highs on one great circle and its lows on the other.
const BASKETBALL_SEAM = tennisCurve(0.29)
const BASKETBALL = [
  along(120, (u): V3 => [Math.cos(u), Math.sin(u), 0]),
  along(120, (u): V3 => [0, Math.sin(u), Math.cos(u)]),
  along(180, BASKETBALL_SEAM),
]

// Football: a surface of revolution about its long (x) axis. Its profile is a circular arc, so the tips come
// to a point like a real football (an ellipse would be blunt). Four seams run tip to tip, two white bands
// circle it near the ends, and the laces sit along the top seam inside a stitched plate.
const HALF_LENGTH = 1
const HALF_WIDTH = 0.6
const ARC_RADIUS = (HALF_LENGTH ** 2 + HALF_WIDTH ** 2) / (2 * HALF_WIDTH)
const radiusAt = (x: number) => Math.max(0, Math.sqrt(ARC_RADIUS ** 2 - x * x) - (ARC_RADIUS - HALF_WIDTH))
const spheroid = (x: number, phi: number): V3 => {
  const r = radiusAt(x)
  return [x, r * Math.cos(phi), r * Math.sin(phi)]
}
const lengthwise = (phi: number, from = -1, to = 1) => Array.from({ length: 61 }, (_, i) => spheroid(from + ((to - from) * i) / 60, phi))
const TOP = Math.PI / 2
const MERIDIANS = [0, 1, 2, 3].map((k) => lengthwise(TOP + (k * Math.PI) / 2, -0.985, 0.985))
const BANDS = [-0.62, 0.62].map((x) => along(90, (u) => spheroid(x, u)))
const PLATE = [...lengthwise(TOP - 0.27, -0.5, 0.5), ...lengthwise(TOP + 0.27, -0.5, 0.5).reverse()]
PLATE.push(PLATE[0])
const LACES = lengthwise(TOP, -0.42, 0.42)

export const FOOTBALL_TILT = (30 * Math.PI) / 180

/** The football's outline (its profile, tilted), as a path. The same silhouette whatever the spin. */
export const FOOTBALL_BODY = (() => {
  const point = (x: number, y: number) => {
    const X = x * Math.cos(FOOTBALL_TILT) - y * Math.sin(FOOTBALL_TILT)
    const Y = x * Math.sin(FOOTBALL_TILT) + y * Math.cos(FOOTBALL_TILT)
    return `${X.toFixed(3)} ${(-Y).toFixed(3)}`
  }
  const xs = Array.from({ length: 81 }, (_, i) => -1 + (2 * i) / 80)
  return `M${[...xs.map((x) => point(x, radiusAt(x))), ...[...xs].reverse().map((x) => point(x, -radiusAt(x)))].join('L')}Z`
})()

export function ballPaths(kind: BallKind, spin: number, tilt = 0.3): BallPaths {
  if (kind === 'football') {
    const view = (p: V3) => rotZ(rotX(p, spin), FOOTBALL_TILT)
    // Lace rungs run across the line of laces, on the surface.
    let rungs = ''
    for (let i = 3; i < LACES.length - 3; i += 6) {
      const x = LACES[i][0]
      const a = view(spheroid(x, TOP - 0.2))
      const b = view(spheroid(x, TOP + 0.2))
      if (a[2] > 0 && b[2] > 0) rungs += `M${a[0].toFixed(3)} ${(-a[1]).toFixed(3)}L${b[0].toFixed(3)} ${(-b[1]).toFixed(3)}`
    }
    return {
      seams: MERIDIANS.map((m) => toPath(m.map(view))).join(''),
      detail: toPath(LACES.map(view)) + rungs,
      stitches: '',
      rails: '',
      bands: BANDS.map((band) => toPath(band.map(view))).join(''),
      plate: toPath(PLATE.map(view)),
    }
  }

  if (kind === 'baseball') {
    const view = tumbleView(spin, tilt)
    const a = RAIL_A.map(view)
    const b = RAIL_B.map(view)
    let stitches = ''
    for (let i = 0; i < STITCHES; i++) {
      const j = (i + 1) % STITCHES
      stitches += thread(a[i], b[j]) + thread(b[i], a[j])
    }
    return {
      seams: toPath(BASEBALL.map(view)),
      detail: ticks(BASEBALL, 5, 0.075, view),
      stitches,
      rails: toPath([...a, a[0]]) + toPath([...b, b[0]]),
      bands: '',
      plate: '',
    }
  }
  const view = tumbleView(spin, tilt)
  return { seams: BASKETBALL.map((curve) => toPath(curve.map(view))).join(''), detail: '', ...NO_EXTRAS }
}
