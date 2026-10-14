import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import type { GlyphName } from '../content'
import { SpinBall } from './ball/SpinBall'
import { LOOKS } from './ball/looks'

// Small 1px line drawings that sit inside a sentence, on the text baseline.
const DRAWINGS: Record<GlyphName, ReactNode> = {
  baseball: (
    <>
      <path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20" />
      {/* Stitches in team red, like the old stitched-ball roundels. */}
      <path d="M6.2 4.6c3 2.4 3 12.4 0 14.8M17.8 4.6c-3 2.4-3 12.4 0 14.8" style={{ stroke: 'var(--sox-red)' }} />
    </>
  ),
  basketball: <path d="M12 2a10 10 0 1 0 0 20a10 10 0 1 0 0-20M2 12h20M12 2v20M5 4.5c4 3.5 4 11.5 0 15M19 4.5c-4 3.5-4 11.5 0 15" />,
  football: (
    <g transform="rotate(-30 12 12)">
      <ellipse cx="12" cy="12" rx="10.5" ry="6.4" />
      <path d="M8.4 12h7.2M9.6 10.2v3.6M12 9.9v4.2M14.4 10.2v3.6" />
      <path d="M5.6 7.9c.8 2.4.8 5.8 0 8.2M18.4 7.9c-.8 2.4-.8 5.8 0 8.2" />
    </g>
  ),
}

// Each glyph starts on a different look, so the first three hovers show three different styles.
const FIRST_LOOK: Record<GlyphName, number> = { baseball: 0, basketball: 1, football: 3 }

// How long the ball keeps spinning after the pointer leaves (also lets a tap on touch screens register).
const LINGER_MS = 700

/** A line-drawn ball in the sentence. Hover (or tap) turns it into a spinning ball, in a new style each time. */
export function InlineGlyph({ name }: { name: GlyphName }) {
  const [open, setOpen] = useState(false)
  const [shows, setShows] = useState(0)
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const look = LOOKS[(FIRST_LOOK[name] + Math.max(shows - 1, 0)) % LOOKS.length]

  function enter() {
    window.clearTimeout(timer.current)
    if (!open) {
      setOpen(true)
      setShows((n) => n + 1)
    }
  }

  function leave() {
    timer.current = window.setTimeout(() => setOpen(false), LINGER_MS)
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
      {open && (
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 z-10 size-[160%] -translate-x-1/2 -translate-y-1/2">
          <SpinBall kind={name} look={look} spinning />
        </span>
      )}
    </span>
  )
}
