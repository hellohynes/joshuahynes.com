// Timing for the terminal print effect: a block cursor prints across the cells, each cell spins random glyphs,
// then a second sweep locks each cell to its real letter. Ported from the approved work-page prototype.
// Pure: `t` is milliseconds since the print started, so the caller owns the clock.

export type FlipTiming = {
  /** Time between the cursor reaching one cell and the next. */
  cursorStepMs: number
  /** How long a cell shows the block cursor before it starts spinning. */
  cursorLifeMs: number
  /** How often a spinning cell re-picks its glyph. */
  tickMs: number
  /** When the lock sweep starts, from the print start. */
  lockDelayMs: number
  /** Time between one cell locking and the next. */
  lockStepMs: number
}

export const FLIP_TIMING: FlipTiming = {
  cursorStepMs: 36,
  cursorLifeMs: 52,
  tickMs: 70,
  lockDelayMs: 380,
  lockStepMs: 45,
}

const END_BLINK_MS = 150
const END_HOLD_MS = 320

export type CellPhase = { phase: 'hidden' | 'cursor' | 'spin' | 'locked'; glyph: number }

export function cellPhase(t: number, index: number, glyphPoolSize: number, timing: FlipTiming = FLIP_TIMING): CellPhase {
  const start = index * timing.cursorStepMs
  if (t < start) return { phase: 'hidden', glyph: 0 }
  if (t < start + timing.cursorLifeMs) return { phase: 'cursor', glyph: 0 }
  if (t >= timing.lockDelayMs + index * timing.lockStepMs) return { phase: 'locked', glyph: 0 }
  const tick = Math.floor((t - start) / timing.tickMs)
  return { phase: 'spin', glyph: glyphPoolSize > 0 ? (index * 11 + tick * 17 + ((tick * tick) % 7)) % glyphPoolSize : 0 }
}

function lastLock(count: number, timing: FlipTiming): number {
  return timing.lockDelayMs + (count - 1) * timing.lockStepMs
}

/** The block cursor that blinks after the last character is printed, until the last one locks. */
export function endCursorVisible(t: number, count: number, timing: FlipTiming = FLIP_TIMING): boolean {
  if (count < 1) return false
  const printed = count * timing.cursorStepMs
  if (t < printed || t >= lastLock(count, timing) + END_HOLD_MS) return false
  return Math.floor((t - printed) / END_BLINK_MS) % 2 === 0
}

/** When everything is finished: every cell locked and the end cursor gone. */
export function flipDuration(count: number, timing: FlipTiming = FLIP_TIMING): number {
  return count < 1 ? 0 : lastLock(count, timing) + END_HOLD_MS
}
