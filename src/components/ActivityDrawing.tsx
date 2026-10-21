import { useEffect, useRef } from 'react'
import { ACTIVITY_GENERATED, ACTIVITY_WEEKS, DOCUMENTS_SINCE } from '../data/activity.ts'
import { summarize } from '../lib/activity.ts'
import { count, formatNumber, monthDay, totalsLine, withYear } from '../lib/format.ts'
import { clampTip, easeOut, hoverProgress } from '../lib/readout.ts'
import {
  busyScale,
  dayAt,
  HOVER_CLEAR_DISTANCE,
  HOVER_STICK,
  HOVER_SWITCH_MARGIN,
  nearestLine,
  weekProfile,
} from '../lib/ridge.ts'

const ROWS = ACTIVITY_WEEKS.length
const SAMPLES = 220
const DRAW_IN_MS = 4000
const HOVER_MS = 700
// The plot fills the whole canvas: edge to edge across, and down the full height with a small inset top and bottom
// (a fraction of the height), so the lines pass over the header, headline and footer whatever the viewport.
const INSET = 0.03
// Peak height as a multiple of the row spacing, so the proportions hold as the rows spread over the screen.
const AMPLITUDE_ROWS = 9
// The hovered day's marker: radius and the ring around it, in CSS px.
const DAY_DOT = 4.5
const DAY_RING = 1.5

const SCALE = busyScale(ACTIVITY_WEEKS)
const PROFILES = ACTIVITY_WEEKS.map((week) => weekProfile(week.days, SCALE))
const SUMMARY = summarize(ACTIVITY_WEEKS)

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * Ink and the blend that lets the lines pass over the headline without hiding it. On a light page the canvas is
 * white-filled and multiplied (white changes nothing); on a dark page it is black-filled and screened (black changes
 * nothing). The fill is the blend's neutral colour, not the page colour, which would visibly lift the screened area.
 */
function readPalette(canvas: HTMLCanvasElement) {
  const style = getComputedStyle(document.documentElement)
  const dark = style.getPropertyValue('color-scheme').includes('dark')
  const palette = {
    ink: style.getPropertyValue('--ink').trim() || (dark ? '#eeebe3' : '#161513'),
    fill: dark ? '#000000' : '#ffffff',
    // Cobalt on near-black is too dim to read as the accent, so dark mode uses a lighter blue.
    cobalt: dark ? '#7f93ff' : '#1f3cff',
  }
  canvas.style.mixBlendMode = dark ? 'screen' : 'multiply'
  return palette
}

/**
 * The last 80 weeks of activity as stacked lines, one per week, drawn over the whole positioned parent (the home
 * page), edge to edge and top to bottom. Purely decorative:
 * the canvas and the readout are aria-hidden and the figures live in `ActivityTotals`. Pointer events are taken from
 * the parent so the canvas never intercepts clicks or text selection.
 */
export function ActivityDrawing() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const tipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const tip = tipRef.current
    const host = canvas?.parentElement
    const ctx = canvas?.getContext('2d')
    if (!canvas || !tip || !host || !ctx) return
    const tipLines = Array.from(tip.children) as HTMLElement[]

    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches
    const pointer = { x: 0, y: 0, inside: false }
    let palette = readPalette(canvas)
    let width = 0
    let height = 0
    let frame = 0
    let startedAt: number | null = null // set when the drawing first scrolls into view
    // The hovered week's top stroke is re-drawn left to right from `since`; null when nothing is hovered.
    let hover: { week: number; since: number } | null = null

    // Everything but the hovered week's top stroke, cached so a hover frame is one blit plus a short stroke.
    const layer = document.createElement('canvas')
    const layerCtx = layer.getContext('2d')
    let layerKey = ''

    const drawInActive = (now: number) => !reducedMotion && startedAt !== null && now - startedAt < DRAW_IN_MS

    const rowsShown = (now: number) => {
      if (reducedMotion) return ROWS
      if (startedAt === null) return 0
      const t = Math.min(1, Math.max(0, (now - startedAt) / DRAW_IN_MS))
      return Math.floor(easeOut(t) * ROWS)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(draw)
    }

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const draw = (now: number) => {
      frame = 0
      ctx.clearRect(0, 0, width, height)
      if (width === 0 || height === 0 || !layerCtx) return

      const x0 = 0
      const x1 = width
      const top = height * INSET
      const bottom = height * (1 - INSET)
      const rowHeight = (bottom - top) / (ROWS - 1)
      const amplitude = rowHeight * AMPLITUDE_ROWS
      const shown = rowsShown(now)
      const pointAt = (week: number, u: number) => ({
        x: x0 + (x1 - x0) * u,
        y: top + week * rowHeight - PROFILES[week](u) * amplitude,
      })

      // The week's line from the left edge to `upTo` (0..1 of the width) as a new path.
      const trace = (c: CanvasRenderingContext2D, week: number, upTo: number) => {
        const last = Math.floor(SAMPLES * upTo)
        c.beginPath()
        for (let i = 0; i <= last; i++) {
          const { x, y } = pointAt(week, i / SAMPLES)
          if (i) c.lineTo(x, y)
          else c.moveTo(x, y)
        }
        if (last < SAMPLES) {
          const { x, y } = pointAt(week, upTo)
          c.lineTo(x, y)
        }
      }

      // The week whose curve is nearest the pointer at its x, sticky to the week already hovered.
      let hot: { week: number; day: number } | null = null
      if (pointer.inside) {
        const u = Math.min(1, Math.max(0, (pointer.x - x0) / (x1 - x0)))
        const curveYs = Array.from({ length: shown }, (_, week) => pointAt(week, u).y)
        const week = nearestLine({
          py: pointer.y,
          curveYs,
          current: hover?.week ?? null,
          stick: HOVER_STICK,
          switchMargin: HOVER_SWITCH_MARGIN,
          clearDistance: HOVER_CLEAR_DISTANCE,
        })
        if (week !== null) hot = { week, day: dayAt(pointer.x, x0, x1) }
      }
      // A new week restarts the animation; moving along the same week does not; leaving clears it.
      if (!hot) hover = null
      else if (hover?.week !== hot.week) hover = { week: hot.week, since: now }
      const progress = hover && !reducedMotion ? hoverProgress(now - hover.since, HOVER_MS) : 1

      // The settled layer: every week in its resting style, oldest first. Each week is filled before it is
      // stroked, so newer weeks hide the older lines behind them.
      const key = `${canvas.width}x${canvas.height}|${shown}|${palette.ink}|${palette.fill}|${palette.cobalt}`
      if (key !== layerKey) {
        layerKey = key
        layer.width = canvas.width
        layer.height = canvas.height
        layerCtx.setTransform(canvas.width / width, 0, 0, canvas.height / height, 0, 0)
        layerCtx.lineJoin = 'round'
        for (let week = 0; week < shown; week++) {
          const base = top + week * rowHeight
          const accent = week === ROWS - 1
          trace(layerCtx, week, 1)
          layerCtx.lineTo(x1, base + 1)
          layerCtx.lineTo(x0, base + 1)
          layerCtx.closePath()
          layerCtx.fillStyle = palette.fill
          layerCtx.fill()
          layerCtx.strokeStyle = accent ? palette.cobalt : palette.ink
          layerCtx.lineWidth = accent ? 1.1 : 0.7
          layerCtx.globalAlpha = accent ? 1 : 0.8
          trace(layerCtx, week, 1)
          layerCtx.stroke()
          layerCtx.globalAlpha = 1
        }
      }
      ctx.drawImage(layer, 0, 0, width, height)

      if (hot) {
        // The hovered week on top of every other line: a stroke only, so it never punches a hole in the drawing.
        ctx.lineJoin = 'round'
        ctx.strokeStyle = palette.cobalt
        ctx.lineWidth = 1.6
        trace(ctx, hot.week, progress)
        ctx.stroke()

        const week = ACTIVITY_WEEKS[hot.week]
        const rest = pointAt(hot.week, (hot.day + 0.5) / 7)
        if (progress === 1) {
          // The hovered day: an accent dot with a ring in the blend's neutral colour (the page, once blended), so it
          // stays visible over the other lines.
          ctx.fillStyle = palette.fill
          ctx.beginPath()
          ctx.arc(rest.x, rest.y, DAY_DOT + DAY_RING, 0, Math.PI * 2)
          ctx.fill()
          ctx.fillStyle = palette.cobalt
          ctx.beginPath()
          ctx.arc(rest.x, rest.y, DAY_DOT, 0, Math.PI * 2)
          ctx.fill()
        }

        const contributions = week.days.reduce<number>((sum, count) => sum + (count ?? 0), 0)
        const day = week.days[hot.day]
        const parts = [count(contributions, 'contribution'), count(week.prs, 'pull request')]
        if (week.documents !== null) parts.push(count(week.documents, 'document'))
        tipLines[0].textContent = `Week of ${monthDay(week.start)} – ${withYear(week.start, 6)}`
        tipLines[1].textContent = parts.join(' · ')
        tipLines[2].textContent = `${WEEKDAYS[hot.day]} ${monthDay(week.start, hot.day)}: ${
          day === null ? 'no data yet' : formatNumber(day)
        }`
        tipLines[2].style.color = palette.cobalt

        // Shown first: a hidden tip has no layout box to measure.
        tip.style.display = 'block'
        const { left, top } = clampTip({
          px: rest.x,
          py: rest.y,
          width,
          height,
          tipWidth: tip.offsetWidth,
          tipHeight: tip.offsetHeight,
        })
        tip.style.left = `${left}px`
        tip.style.top = `${top}px`
      } else {
        tip.style.display = 'none'
      }

      if (drawInActive(now) || progress < 1) schedule()
    }

    const setPointer = (event: PointerEvent) => {
      const box = canvas.getBoundingClientRect()
      pointer.x = event.clientX - box.left
      pointer.y = event.clientY - box.top
      pointer.inside = true
      schedule()
    }
    const clearPointer = () => {
      pointer.inside = false
      schedule()
    }
    // A touch ends with a pointerleave right after the tap, which would hide the readout it just showed.
    const onLeave = (event: PointerEvent) => {
      if (event.pointerType !== 'touch') clearPointer()
    }
    // On touch the readout stays until a tap lands somewhere else on the page.
    const onDocumentDown = (event: PointerEvent) => {
      if (!host.contains(event.target as Node)) clearPointer()
    }

    host.addEventListener('pointermove', setPointer)
    host.addEventListener('pointerdown', setPointer)
    host.addEventListener('pointerleave', onLeave)
    host.addEventListener('pointercancel', clearPointer)
    document.addEventListener('pointerdown', onDocumentDown)

    // Resizing clears the canvas, so draw straight away rather than waiting a frame with it blank.
    const resizeObserver = new ResizeObserver(() => {
      cancelAnimationFrame(frame)
      frame = 0
      resize()
      draw(performance.now())
    })
    resizeObserver.observe(canvas)

    const onTheme = () => {
      palette = readPalette(canvas)
      schedule()
    }
    const themeObserver = new MutationObserver(onTheme)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    const colorScheme = matchMedia('(prefers-color-scheme: dark)')
    colorScheme.addEventListener('change', onTheme)

    let visibility: IntersectionObserver | undefined
    if (!reducedMotion) {
      visibility = new IntersectionObserver(
        (entries) => {
          if (!entries.some((entry) => entry.isIntersecting)) return
          startedAt = performance.now()
          visibility?.disconnect()
          schedule()
        },
        { threshold: 0.15 },
      )
      visibility.observe(canvas)
    }

    resize()
    schedule()

    return () => {
      cancelAnimationFrame(frame)
      host.removeEventListener('pointermove', setPointer)
      host.removeEventListener('pointerdown', setPointer)
      host.removeEventListener('pointerleave', onLeave)
      host.removeEventListener('pointercancel', clearPointer)
      document.removeEventListener('pointerdown', onDocumentDown)
      resizeObserver.disconnect()
      themeObserver.disconnect()
      colorScheme.removeEventListener('change', onTheme)
      visibility?.disconnect()
    }
  }, [])

  return (
    <>
      <canvas ref={canvasRef} aria-hidden="true" className="activity-canvas" />
      <div ref={tipRef} aria-hidden="true" className="activity-tip">
        <div />
        <div />
        <div />
      </div>
    </>
  )
}

/** The figures behind the drawing, as real text. */
export function ActivityTotals() {
  const line = totalsLine({ summary: SUMMARY, weeks: ROWS, documentsSince: DOCUMENTS_SINCE, generated: ACTIVITY_GENERATED })
  return <p className="m-0 text-[13px] leading-[1.4] tracking-[-0.2px] text-ink md:text-right">{line}</p>
}
