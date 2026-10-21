// How much to shrink a line so it fits its container. Pure: the caller measures both widths.

/** 1 when the line fits (or either width is unmeasurable), otherwise the ratio, never below `min`. */
export function fitScale(available: number, natural: number, min = 0.4): number {
  if (natural <= 0 || available <= 0 || natural <= available) return 1
  return Math.max(min, available / natural)
}
