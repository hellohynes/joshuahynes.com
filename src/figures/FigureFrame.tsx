import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { useFigureInput } from './useFigureInput'
import type { Point } from './useFigureInput'

function useInView(ref: RefObject<Element | null>) {
  const [seen, setSeen] = useState(() => typeof IntersectionObserver === 'undefined')

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, seen])

  return seen
}

type Box = [x: number, y: number, width: number, height: number]

interface FigureFrameProps {
  label: string
  /** which team's colours the figure uses */
  team: 'sox' | 'pats' | 'celtics'
  /** viewBox crop; defaults to the full 400x320 stage */
  box?: Box
  rest: Point
  /** optionally pull pointer positions onto points of interest */
  snap?: (p: Point) => Point
  /** optionally replace the arrow-key behaviour */
  keys?: (key: string) => Point | undefined
  caption: (p: Point) => string
  children: (p: Point) => ReactNode
}

/** Shared shell: svg stage, pointer/keyboard input, draw-in, and the read-out. */
export function FigureFrame({ label, team, box = [0, 0, 400, 320], rest, snap, keys, caption, children }: FigureFrameProps) {
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref)
  const { value, bind } = useFigureInput(rest, snap, keys)

  return (
    <figure ref={ref} className="fig m-0" data-team={team} data-in={inView ? '' : undefined}>
      <svg
        viewBox={box.join(' ')}
        style={{ aspectRatio: `${box[2]} / ${box[3]}` }}
        role="group"
        aria-label={label}
        tabIndex={0}
        // Clicking should not select the drawing or draw a focus box; keyboard focus still shows the ring.
        onMouseDown={(e) => e.preventDefault()}
        {...bind}
      >
        {children(value)}
      </svg>
      <figcaption className="mt-3 font-mono text-[0.7rem] uppercase tracking-[0.08em] text-muted">
        {caption(value)}
      </figcaption>
    </figure>
  )
}
