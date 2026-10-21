import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
export type GlyphName = 'baseball' | 'basketball' | 'football'
import { SpinBall } from './ball/SpinBall'
import { LOOKS } from './ball/looks'
import type { Look } from './ball/looks'

// Line drawings that sit inside a sentence, on the text baseline. They follow three icon references, so each
// has its own weight: the basketball and football are bold, the baseball a fine outline with a stitched seam.
// All are drawn in a 24 x 24 box with the ball about 20 across.

type P = [number, number]

/** Short crossing ticks along a quadratic curve, like the stitches of a baseball seam (a herringbone). */
function stitchTicks(p0: P, c: P, p2: P, count: number, half: number, skew: number) {
  let d = ''
  for (let i = 0; i < count; i++) {
    const t = 0.07 + (0.86 * i) / (count - 1)
    const mt = 1 - t
    const x = mt * mt * p0[0] + 2 * mt * t * c[0] + t * t * p2[0]
    const y = mt * mt * p0[1] + 2 * mt * t * c[1] + t * t * p2[1]
    const dx = 2 * mt * (c[0] - p0[0]) + 2 * t * (p2[0] - c[0])
    const dy = 2 * mt * (c[1] - p0[1]) + 2 * t * (p2[1] - c[1])
    // The normal to the seam, turned by `skew` so the ticks lean along it.
    const a = Math.atan2(dx, -dy) + skew
    const nx = Math.cos(a)
    const ny = Math.sin(a)
    d += `M${(x - nx * half).toFixed(2)} ${(y - ny * half).toFixed(2)}L${(x + nx * half).toFixed(2)} ${(y + ny * half).toFixed(2)}`
  }
  return d
}

// Baseball: two seams, one the other turned half way round the ball.
const SEAM_A: [P, P, P] = [[12.35, 2], [9.4, 7.2], [2, 12.7]]
const SEAM_B: [P, P, P] = [[11.65, 22], [14.6, 16.8], [22, 11.3]]
const seamPath = ([a, c, b]: [P, P, P]) => `M${a[0]} ${a[1]}Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`
const BASEBALL_SEAMS = seamPath(SEAM_A) + seamPath(SEAM_B)
const BASEBALL_TICKS = stitchTicks(...SEAM_A, 10, 1.15, 0.62) + stitchTicks(...SEAM_B, 10, 1.15, 0.62)

const DRAWINGS: Record<GlyphName, ReactNode> = {
  baseball: (
    <>
      <circle cx="12" cy="12" r="10" strokeWidth="0.42" />
      {/* The seams and stitches are in team red, a heavier line than the outline. */}
      <g style={{ stroke: 'var(--sox-red)' }} strokeWidth="0.62">
        <path d={BASEBALL_SEAMS} />
        <path d={BASEBALL_TICKS} strokeWidth="0.5" />
      </g>
    </>
  ),
  // A cross through the ball's centre, and a pair of arcs bowing in from either side.
  basketball: (
    <g strokeWidth="0.86">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20M4.93 4.93Q11.07 12 4.93 19.07M19.07 4.93Q12.93 12 19.07 19.07" />
    </g>
  ),
  // A pointed lens turned to about 45 degrees: two bands across the ends and three laces down the middle.
  football: (
    <g transform="translate(12 12) rotate(-45)" strokeWidth="0.86" strokeLinecap="round" strokeLinejoin="round">
      <path d="M-11 0Q0 -11.4 11 0Q0 11.4 -11 0Z" />
      <path d="M-6.6 -3.6V3.6M6.6 -3.6V3.6" />
      <path d="M-3.9 0H3.9M-2.6 -1.5V1.5M0 -1.5V1.5M2.6 -1.5V1.5" />
    </g>
  ),
}

// A touch has no hover: the pointer "leaves" the moment the finger lifts, so a tap keeps the ball for a moment.
const TAP_LINGER_MS = 1800

/** A random style, never the one just shown, so every hover looks different. */
function pickLook(previous: Look | null): Look {
  const choices = LOOKS.filter((l) => l !== previous)
  return choices[Math.floor(Math.random() * choices.length)]
}

/**
 * A line-drawn ball in the sentence. Hovering it turns it into a spinning ball in a random style; leaving
 * puts the line drawing back, and the next hover picks another style.
 */
export function InlineGlyph({ name }: { name: GlyphName }) {
  const [look, setLook] = useState<Look | null>(null) // the style on show; null means the line drawing
  const last = useRef<Look | null>(null)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const open = look !== null

  function enter() {
    window.clearTimeout(timer.current)
    if (look) return
    const next = pickLook(last.current)
    last.current = next
    setLook(next)
  }

  function leave(e: PointerEvent<HTMLSpanElement>) {
    window.clearTimeout(timer.current)
    if (e.pointerType === 'touch') timer.current = window.setTimeout(() => setLook(null), TAP_LINGER_MS)
    else setLook(null)
  }

  return (
    <span
      className="relative mr-[0.14em] inline-block h-[0.72em] w-[0.72em] align-[-0.04em]"
      onPointerEnter={enter}
      onPointerLeave={leave}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className={`absolute inset-0 size-full fill-none stroke-current transition-opacity duration-200 ${open ? 'opacity-0' : ''}`}
        strokeWidth={0.86}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {DRAWINGS[name]}
      </svg>
      {look && (
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-[160%] -translate-x-1/2 -translate-y-1/2">
          <SpinBall kind={name} look={look} spinning />
        </span>
      )}
    </span>
  )
}
