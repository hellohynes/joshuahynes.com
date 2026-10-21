// Pure helpers for the drawing's hover animation: no DOM, React or Vite imports.

export const easeOut = (t: number): number => 1 - (1 - t) ** 3

/** Eased progress 0..1 of an animation `elapsed` ms in; a zero duration is already finished. */
export function hoverProgress(elapsed: number, duration: number): number {
  if (duration <= 0) return 1
  return easeOut(Math.min(1, Math.max(0, elapsed / duration)))
}
