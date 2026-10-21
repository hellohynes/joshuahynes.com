// Pure helpers for the drawing's hover readout and hover animation: no DOM, React or Vite imports.

export const easeOut = (t: number): number => 1 - (1 - t) ** 3

/** Eased progress 0..1 of an animation `elapsed` ms in; a zero duration is already finished. */
export function hoverProgress(elapsed: number, duration: number): number {
  if (duration <= 0) return 1
  return easeOut(Math.min(1, Math.max(0, elapsed / duration)))
}

/**
 * Where to put the readout box, in host coordinates. It prefers the right of the point and above it, flips to
 * the left when the right would overflow, and is then clamped on both sides (and top and bottom) so it stays
 * inside `margin` of the host. A box wider than the host is pinned to the left margin.
 */
export function clampTip(args: {
  px: number
  py: number
  width: number
  height: number
  tipWidth: number
  tipHeight: number
  margin?: number
}): { left: number; top: number } {
  const { px, py, width, height, tipWidth, tipHeight, margin = 8 } = args
  const right = px + 14
  const left = right + tipWidth > width - margin ? px - 14 - tipWidth : right
  return {
    left: Math.max(margin, Math.min(width - tipWidth - margin, left)),
    top: Math.max(margin, Math.min(height - tipHeight - margin, py - tipHeight - 10)),
  }
}
