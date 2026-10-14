import { useEffect, useRef, useState } from 'react'
import type { PointerEvent, ReactNode } from 'react'
import type { GlyphName } from '../content'
import { SpinBall } from './ball/SpinBall'
import { LOOKS } from './ball/looks'
import type { Look } from './ball/looks'

// Small 1px line drawings that sit inside a sentence, on the text baseline.
const DRAWINGS: Record<GlyphName, ReactNode> = {
  baseball: (
    <>
      <path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20" />
      {/* Stitches in team red, like the old stitched-ball roundels. */}
      <path d="M6.2 4.6c3 2.4 3 12.4 0 14.8M17.8 4.6c-3 2.4-3 12.4 0 14.8" style={{ stroke: 'var(--sox-red)' }} />
    </>
  ),
  // The ball seen from a pole: the two great circles are a cross, and the winding seam is a lens through its ends.
  basketball: <path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20M2 12h20M12 2v20M12 2C2.7 7 2.7 17 12 22M12 2C21.3 7 21.3 17 12 22" />,
  football: (
    <g transform="rotate(-30 12 12)">
      <ellipse cx="12" cy="12" rx="10.5" ry="6.4" />
      <path d="M8.4 12h7.2M9.6 10.2v3.6M12 9.9v4.2M14.4 10.2v3.6" />
      <path d="M5.6 7.9c.8 2.4.8 5.8 0 8.2M18.4 7.9c-.8 2.4-.8 5.8 0 8.2" />
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
        strokeWidth={1.25}
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
