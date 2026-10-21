// Pure tone ramp for the ridge drawing: no DOM, React or Vite imports.

/** The oldest (back-most) week's stroke alpha: a light grey once drawn in ink. */
export const DEPTH_ALPHA_MIN = 0.18
const DEPTH_CURVE = 1.4

/**
 * Stroke alpha by depth: the newest week (the last index, at the front) is fully strong and older weeks fade towards
 * `DEPTH_ALPHA_MIN`. The exponent keeps the newest weeks strong and lets the fade gather towards the back.
 */
export function depthAlpha(index: number, rows: number): number {
  if (rows <= 1) return 1
  const t = Math.min(1, Math.max(0, index / (rows - 1)))
  return DEPTH_ALPHA_MIN + (1 - DEPTH_ALPHA_MIN) * t ** DEPTH_CURVE
}
