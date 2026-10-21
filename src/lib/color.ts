export const INK = '#121110'
export const PAPER = '#f2eee5'

// WCAG 2.x relative luminance of a `#rrggbb` colour.
function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function contrastRatio(a: string, b: string): number {
  const la = luminance(a)
  const lb = luminance(b)
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

// Page ink or paper, whichever contrasts more with the background.
export function readableText(background: string): typeof INK | typeof PAPER {
  return contrastRatio(background, INK) >= contrastRatio(background, PAPER) ? INK : PAPER
}
