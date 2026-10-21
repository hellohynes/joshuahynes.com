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
 * Where a week's line ends, as `u` in 0..1 across the week: the centre of the last recorded day, so a week whose
 * later days have not happened yet stops there instead of running on at zero. Only trailing nulls shorten it; a null
 * between recorded days is a quiet day. 1 for a full week, 0 when nothing is recorded.
 */
export function weekEnd(days: readonly (number | null)[]): number {
  let last = days.length - 1
  while (last >= 0 && days[last] === null) last--
  if (last === days.length - 1) return 1
  return last < 0 ? 0 : (last + 0.5) / days.length
}

/** Hover tuning, in CSS px. */
export const HOVER_STICK = 10
export const HOVER_SWITCH_MARGIN = 6
export const HOVER_CLEAR_DISTANCE = 14

/**
 * Pick the week whose curve is nearest the pointer, given each week's curve height `curveYs[i]` at the pointer's x
 * (oldest first). The hovered week `current` is sticky: it is kept while the pointer is within `stick` of its curve,
 * unless another curve is closer by more than `switchMargin`, so dragging along a line does not jump to the line
 * behind it at a crossing. Outside the stick band the nearest curve wins (a tie goes to the newer week). When even
 * the nearest curve is farther than `clearDistance`, nothing is hovered (null). A non-finite entry means the week has
 * no line at that x (it ends further left): it is never chosen and, as the current week, is dropped.
 */
export function nearestLine(args: {
  py: number
  curveYs: readonly number[]
  current: number | null
  stick: number
  switchMargin: number
  clearDistance: number
}): number | null {
  const { py, curveYs, current, stick, switchMargin, clearDistance } = args
  let nearest = -1
  let nearestDistance = Infinity
  for (let i = 0; i < curveYs.length; i++) {
    if (!Number.isFinite(curveYs[i])) continue
    const distance = Math.abs(py - curveYs[i])
    if (distance <= nearestDistance) {
      nearest = i
      nearestDistance = distance
    }
  }
  if (nearest === -1 || nearestDistance > clearDistance) return null

  if (current !== null && current >= 0 && current < curveYs.length && Number.isFinite(curveYs[current])) {
    const currentDistance = Math.abs(py - curveYs[current])
    if (currentDistance <= stick && currentDistance - nearestDistance <= switchMargin) return current
  }
  return nearest
}

/** The day (0..6) under `x` across the plot `x0..x1`, clamped to the ends. */
export function dayAt(x: number, x0: number, x1: number): number {
  return Math.min(6, Math.max(0, Math.floor(((x - x0) / (x1 - x0)) * 7)))
}
