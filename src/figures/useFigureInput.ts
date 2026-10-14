import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import type { KeyboardEvent, PointerEvent } from 'react'

export interface Point {
  x: number
  y: number
}

const REDUCE = '(prefers-reduced-motion: reduce)'

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCE)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCE).matches,
    () => false,
  )
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const KEY_STEP = 0.08

/**
 * Pointer / arrow-key input for a figure, as a spring-smoothed point in 0..1.
 * An optional `snap` pulls positions (including the rest pose) onto points of interest, and
 * `keys` replaces the arrow-key behaviour, e.g. to step between those points.
 * The point eases back to `rest` when the pointer or focus leaves. Under
 * reduced motion it snaps to the target instead of easing.
 */
export function useFigureInput(rest: Point, snap?: (p: Point) => Point, keys?: (key: string) => Point | undefined) {
  const reduced = useReducedMotion()
  const [value, setValue] = useState<Point>(rest)
  const target = useRef<Point>(rest)
  const current = useRef<Point>(rest)
  const frame = useRef(0)

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function tick() {
    const from = current.current
    const to = target.current
    const next = { x: from.x + (to.x - from.x) * 0.18, y: from.y + (to.y - from.y) * 0.18 }
    const settled = Math.abs(to.x - next.x) < 0.002 && Math.abs(to.y - next.y) < 0.002
    current.current = settled ? to : next
    setValue(current.current)
    frame.current = settled ? 0 : requestAnimationFrame(tick)
  }

  function aim(next: Point) {
    target.current = next
    if (reduced) {
      current.current = next
      setValue(next)
    } else if (!frame.current) {
      frame.current = requestAnimationFrame(tick)
    }
  }

  const bind = {
    onPointerMove(e: PointerEvent<SVGSVGElement>) {
      const box = e.currentTarget.getBoundingClientRect()
      const raw = { x: clamp01((e.clientX - box.left) / box.width), y: clamp01((e.clientY - box.top) / box.height) }
      aim(snap ? snap(raw) : raw)
    },
    onPointerLeave() {
      aim(snap ? snap(rest) : rest)
    },
    onBlur() {
      aim(snap ? snap(rest) : rest)
    },
    onKeyDown(e: KeyboardEvent<SVGSVGElement>) {
      const { x, y } = target.current
      const moves: Record<string, Point> = {
        ArrowLeft: { x: x - KEY_STEP, y },
        ArrowRight: { x: x + KEY_STEP, y },
        ArrowUp: { x, y: y - KEY_STEP },
        ArrowDown: { x, y: y + KEY_STEP },
      }
      const next = keys ? keys(e.key) : moves[e.key]
      if (!next) return
      e.preventDefault()
      aim({ x: clamp01(next.x), y: clamp01(next.y) })
    },
  }

  return { value, bind }
}
