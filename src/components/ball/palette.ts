import type { BallKind } from './geometry'

export const PALETTE: Record<BallKind, { base: string; light: string; dark: string; seam: string; detail: string }> = {
  baseball: { base: '#f1e9d8', light: '#fffdf6', dark: '#b3a283', seam: '#b3a283', detail: '#bd3039' },
  basketball: { base: '#e07a2f', light: '#f7a85f', dark: '#7d3410', seam: '#24120a', detail: '#24120a' },
  football: { base: '#8a4b2a', light: '#bc7d52', dark: '#3f1d0e', seam: '#2a1209', detail: '#f3ead6' },
}

export const SPHERE = 'M-1 0A1 1 0 1 0 1 0A1 1 0 1 0 -1 0Z'
// The football's body: an ellipse (1 x 0.62) tilted 30 degrees counter-clockwise, written without a transform
// so gradients and highlights stay lit from the top left.
export const FOOTBALL = 'M0.866 -0.5A1 0.62 -30 1 0 -0.866 0.5A1 0.62 -30 1 0 0.866 -0.5Z'

export const mix = (a: string, b: string, t: number) => {
  const n = (h: string, i: number) => parseInt(h.slice(1 + i * 2, 3 + i * 2), 16)
  const c = (i: number) => Math.round(n(a, i) + (n(b, i) - n(a, i)) * t).toString(16).padStart(2, '0')
  return `#${c(0)}${c(1)}${c(2)}`
}
