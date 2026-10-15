import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { CONTRIBUTION_WEEKS } from '../../data/contributions'
import { useReducedMotion } from '../../figures/useFigureInput'

const SHOWN = 13 // weeks on show: about three months
const LAST = Math.max(0, CONTRIBUTION_WEEKS.length - SHOWN) // the newest window
const STEP_MS = 130 // how long each week-step takes while looping through the year
const END_PAUSE_MS = 700 // a beat on the newest window before the loop starts over
const TOUCH_MS = 5000 // a touch has no hover, so a tap runs the loop for a while

const CELL = 10
const GAP = 2
const WIDTH = SHOWN * (CELL + GAP) - GAP
const HEIGHT = 7 * (CELL + GAP) - GAP

/**
 * The last three months of the GitHub contribution graph, in GitHub's greens. On hover (or a tap) it slides
 * back through the last year and loops, one week at a time, then settles back on the latest three months.
 */
export function ContributionGraph() {
  const reduced = useReducedMotion()
  const [start, setStart] = useState(LAST)
  const [running, setRunning] = useState(false)
  const touchTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(touchTimer.current), [])

  // While running, a timer steps the window forward a week at a time, and wraps round at the newest one.
  // The step lives in a ref so the timer never depends on a state updater (React may run those twice).
  const step = useRef(0)
  useEffect(() => {
    if (!running || reduced) return
    let timer = 0
    const tick = () => {
      step.current = step.current >= LAST ? 0 : step.current + 1
      setStart(step.current)
      timer = window.setTimeout(tick, step.current === LAST ? END_PAUSE_MS : STEP_MS)
    }
    timer = window.setTimeout(tick, STEP_MS)
    return () => window.clearTimeout(timer)
  }, [running, reduced])

  function enter() {
    window.clearTimeout(touchTimer.current)
    step.current = 0 // the loop begins a year ago
    setStart(0)
    setRunning(true)
  }

  function leave(e: PointerEvent<HTMLSpanElement>) {
    window.clearTimeout(touchTimer.current)
    if (e.pointerType === 'touch') touchTimer.current = window.setTimeout(() => setRunning(false), TOUCH_MS)
    else setRunning(false)
  }

  // At rest, and under reduced motion, the newest three months show.
  const from = running && !reduced ? start : LAST
  const weeks = CONTRIBUTION_WEEKS.slice(from, from + SHOWN)

  return (
    <span className="mx-[0.2em] inline-block h-[1.2em] align-[-0.24em]" onPointerEnter={enter} onPointerLeave={leave}>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        role="img"
        aria-label="GitHub contributions, last three months"
        className="h-full w-auto"
      >
        {weeks.map((week, col) =>
          Array.from(week).map((level, row) =>
            level === '-' ? null : (
              <rect
                key={`${col}-${row}`}
                x={col * (CELL + GAP)}
                y={row * (CELL + GAP)}
                width={CELL}
                height={CELL}
                rx="2"
                style={{ fill: `var(--gh-${level})` }}
                className="motion-safe:transition-[fill] motion-safe:duration-100"
              />
            ),
          ),
        )}
      </svg>
    </span>
  )
}
