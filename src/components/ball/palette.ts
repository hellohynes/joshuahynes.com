import { FOOTBALL_BODY } from './geometry'
import type { BallKind } from './geometry'

export const PALETTE: Record<BallKind, { base: string; light: string; dark: string; seam: string; detail: string }> = {
  baseball: { base: '#f1e9d8', light: '#fffdf6', dark: '#b3a283', seam: '#b3a283', detail: '#bd3039' },
  basketball: { base: '#dd5a22', light: '#f48a4b', dark: '#6e2509', seam: '#2a1408', detail: '#2a1408' },
  football: { base: '#b5482a', light: '#e07d52', dark: '#5e2010', seam: '#3a1509', detail: '#f6f1e8' },
}

export const SPHERE = 'M-1 0A1 1 0 1 0 1 0A1 1 0 1 0 -1 0Z'
export const FOOTBALL = FOOTBALL_BODY

export const mix = (a: string, b: string, t: number) => {
  const n = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const c = (i: number) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, '0')
  return `#${c(0)}${c(1)}${c(2)}`
}
