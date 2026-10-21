// Pure maths for the ridge drawing: no DOM, React or Vite imports.
import type { WeekActivity } from './activity.ts'

/**
 * Fritsch-Carlson monotone cubic through (xs[i], ys[i]). `xs` must be strictly increasing. The curve passes
 * through every knot and never overshoots between knots; outside the knots it holds the end values.
 */
export function monotoneCurve(xs: readonly number[], ys: readonly number[]): (x: number) => number {
  const n = xs.length
  if (n === 0) return () => 0
  if (n === 1) return () => ys[0]

  const slope: number[] = []
  for (let i = 0; i < n - 1; i++) slope.push((ys[i + 1] - ys[i]) / (xs[i + 1] - xs[i]))

  // Tangents: zero at a local extremum, otherwise the mean of the neighbouring slopes.
  const tangent: number[] = [slope[0]]
  for (let i = 1; i < n - 1; i++) {
    tangent.push(slope[i - 1] * slope[i] <= 0 ? 0 : (slope[i - 1] + slope[i]) / 2)
  }
  tangent.push(slope[n - 2])

  // Flatten tangents on a flat segment, and shrink any that would let the segment overshoot.
  for (let i = 0; i < n - 1; i++) {
    if (slope[i] === 0) {
      tangent[i] = 0
      tangent[i + 1] = 0
      continue
    }
    const a = tangent[i] / slope[i]
    const b = tangent[i + 1] / slope[i]
    const sumSquares = a * a + b * b
    if (sumSquares > 9) {
      const k = 3 / Math.sqrt(sumSquares)
      tangent[i] = k * a * slope[i]
      tangent[i + 1] = k * b * slope[i]
    }
  }

  return (x) => {
    if (x <= xs[0]) return ys[0]
    if (x >= xs[n - 1]) return ys[n - 1]
    let i = 0
    while (i < n - 2 && x > xs[i + 1]) i++
    const h = xs[i + 1] - xs[i]
    const s = (x - xs[i]) / h
    const s2 = s * s
    const s3 = s2 * s
    return (
      (2 * s3 - 3 * s2 + 1) * ys[i] +
      (s3 - 2 * s2 + s) * h * tangent[i] +
      (-2 * s3 + 3 * s2) * ys[i + 1] +
      (s3 - s2) * h * tangent[i + 1]
    )
  }
}

/** A typical busy day: the 94th percentile of all non-null daily counts, so one huge day cannot flatten the rest. Minimum 1. */
export function busyScale(weeks: readonly WeekActivity[]): number {
  const counts = weeks
    .flatMap((week) => week.days)
    .filter((count): count is number => count !== null)
    .sort((a, b) => a - b)
  if (counts.length === 0) return 1
  return Math.max(1, counts[Math.floor(counts.length * 0.94)])
}

/**
 * One week as a curve over `u` in 0..1. Knots sit at both ends (height 0) and at each day centre
 * `(i + 0.5) / 7`, with height `min(1.25, sqrt(count / scale))`; a null day counts as 0.
 */
export function weekProfile(days: readonly (number | null)[], scale: number): (u: number) => number {
  const xs = [0, ...days.map((_, i) => (i + 0.5) / days.length), 1]
  const ys = [0, ...days.map((count) => Math.min(1.25, Math.sqrt((count ?? 0) / scale))), 0]
  return monotoneCurve(xs, ys)
}

/**
 * Map a pointer position to a week row and a day. Rows are evenly spaced from `top` to `bottom`. `week` is
 * the nearest row; a pointer up to one row-height beyond the first or last row still counts (clamped to
 * it), further out is null. `x` outside `x0..x1` is null; `x` exactly at `x1` is day 6. With a single row
 * there is no row spacing, so any `y` within `top..bottom` resolves to week 0.
 */
export function hitTest(args: {
  x: number
  y: number
  x0: number
  x1: number
  top: number
  bottom: number
  rows: number
}): { week: number; day: number } | null {
  const { x, y, x0, x1, top, bottom, rows } = args
  if (x < x0 || x > x1) return null

  const rowHeight = rows > 1 ? (bottom - top) / (rows - 1) : 0
  if (y < top - rowHeight || y > bottom + rowHeight) return null

  const week = rowHeight === 0 ? 0 : Math.min(rows - 1, Math.max(0, Math.round((y - top) / rowHeight)))
  const day = Math.min(6, Math.max(0, Math.floor(((x - x0) / (x1 - x0)) * 7)))
  return { week, day }
}
