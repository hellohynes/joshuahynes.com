import type { CSSProperties } from 'react'

// The five intensity steps of a contribution graph's legend. On hover they fill in, left to right.
const LEVELS = [0, 0.25, 0.5, 0.75, 1]

export function CommitLegend() {
  return (
    <span className="group mx-[0.2em] inline-block h-[0.72em] align-[-0.04em]">
      <svg viewBox="0 0 66 12" aria-hidden="true" className="h-full w-auto" fill="none">
        {LEVELS.map((level, i) => (
          <rect
            key={level}
            x={1 + i * 13}
            y="1"
            width="10"
            height="10"
            rx="2"
            strokeWidth="1"
            className="stroke-current fill-accent [fill-opacity:0] motion-safe:transition-[fill-opacity] motion-safe:duration-200 group-hover:[fill-opacity:var(--level)]"
            style={{ '--level': level, transitionDelay: `${i * 70}ms` } as CSSProperties}
          />
        ))}
      </svg>
    </span>
  )
}
