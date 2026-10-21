// Pure timing for the drawing's draw-in: no DOM, React or Vite imports.
import { easeOut } from './readout.ts'

/**
 * Eased progress 0..1 of line `index` at `elapsedMs` into the draw-in. Line `index` starts `index * staggerMs` after
 * the first and takes `lineMs` to cross; a zero duration is already finished once started.
 */
export function drawProgress(elapsedMs: number, index: number, staggerMs: number, lineMs: number): number {
  const local = elapsedMs - index * staggerMs
  if (local <= 0) return 0
  if (lineMs <= 0) return 1
  return easeOut(Math.min(1, local / lineMs))
}
