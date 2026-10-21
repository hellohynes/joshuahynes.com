import { useEffect, useRef } from 'react'
import { ACTIVITY_GENERATED, ACTIVITY_WEEKS } from '../data/activity.ts'
import { summarize } from '../lib/activity.ts'
import { hoverProgress, easeOut } from '../lib/readout.ts'
import { busyScale, hitTest, weekProfile } from '../lib/ridge.ts'

const ROWS = ACTIVITY_WEEKS.length
const SAMPLES = 220
const DRAW_IN_MS = 4000
const HOVER_MS = 700
// The vertical plot band as fractions of the band element (`main`), so the lines pass over the headline whatever
// the viewport. Horizontally the lines run the full width of the canvas, edge to edge.
const BAND = { top: 0.17, bottom: 0.86 }

const SCALE = busyScale(ACTIVITY_WEEKS)
const PROFILES = ACTIVITY_WEEKS.map((week) => weekProfile(week.days, SCALE))
const SUMMARY = summarize(ACTIVITY_WEEKS)

const numbers = new Intl.NumberFormat('en-US')
const count = (n: number, noun: string): string => `${numbers.format(n)} ${noun}${n === 1 ? '' : 's'}`
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Dates are `YYYY-MM-DD`; building them in UTC and reading them back in UTC keeps the day from shifting with the time zone.
const utc = (date: string, addDays = 0): Date => {
  const [year, month, day] = date.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day + addDays))
}
const monthDay = (date: Date): string => `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`
const withYear = (date: Date): string => `${monthDay(date)}, ${date.getUTCFullYear()}`

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
 * The last 80 weeks of activity as stacked lines, one per week, drawn edge to edge over the positioned parent (the
 * whole home page); the vertical band comes from the `data-activity-band` element inside it. Purely decorative:
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
    let plotTop = 0 // the vertical plot band, in canvas coordinates; set by resize()
    let plotBottom = 0
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
      const box = canvas.getBoundingClientRect()
      const band = (host.querySelector('[data-activity-band]') ?? host).getBoundingClientRect()
      width = canvas.clientWidth
      height = canvas.clientHeight
      plotTop = band.top - box.top + band.height * BAND.top
      plotBottom = band.top - box.top + band.height * BAND.bottom
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
      const top = plotTop
      const bottom = plotBottom
      const rowHeight = (bottom - top) / (ROWS - 1)
      const amplitude = rowHeight * 9
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

      const hit = pointer.inside ? hitTest({ x: pointer.x, y: pointer.y, x0, x1, top, bottom, rows: ROWS }) : null
      const hot = hit && hit.week < shown ? hit : null
      // A new week restarts the animation; moving along the same week does not; leaving clears it.
      if (!hot) hover = null
      else if (hover?.week !== hot.week) hover = { week: hot.week, since: now }
      const progress = hover && !reducedMotion ? hoverProgress(now - hover.since, HOVER_MS) : 1

      // The settled layer: every week in its resting style, oldest first. Each week is filled before it is
      // stroked, so newer weeks hide the older lines behind them.
      const key = `${canvas.width}x${canvas.height}|${top}|${bottom}|${shown}|${palette.ink}|${palette.fill}|${palette.cobalt}`
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
        // The dot travels with the line, then rests at the hovered day.
        const dot = progress < 1 ? pointAt(hot.week, progress) : pointAt(hot.week, (hot.day + 0.5) / 7)
        const px = dot.x
        const py = dot.y
        ctx.fillStyle = palette.cobalt
        ctx.beginPath()
        ctx.arc(px, py, progress < 1 ? 2.6 : 2.4, 0, Math.PI * 2)
        ctx.fill()

        const contributions = week.days.reduce<number>((sum, count) => sum + (count ?? 0), 0)
        const day = week.days[hot.day]
        const parts = [count(contributions, 'contribution'), count(week.prs, 'pull request')]
        if (week.documents !== null) parts.push(count(week.documents, 'document'))
        tipLines[0].textContent = `Week of ${monthDay(utc(week.start))} – ${withYear(utc(week.start, 6))}`
        tipLines[1].textContent = parts.join(' · ')
        tipLines[2].textContent = `${WEEKDAYS[hot.day]} ${monthDay(utc(week.start, hot.day))}: ${
          day === null ? 'not yet' : numbers.format(day)
        }`
        tipLines[2].style.color = palette.cobalt

        // The readout anchors to the hovered day's point, not to the travelling dot.
        const rest = pointAt(hot.week, (hot.day + 0.5) / 7)
        const tipWidth = tip.offsetWidth
        const tipHeight = tip.offsetHeight
        const margin = 8
        const right = rest.x + 14
        const left = right + tipWidth > width - margin ? rest.x - 14 - tipWidth : right
        tip.style.left = `${Math.max(margin, left)}px`
        tip.style.top = `${Math.min(height - tipHeight - margin, Math.max(margin, rest.y - tipHeight - 10))}px`
        tip.style.visibility = 'visible'
      } else {
        tip.style.visibility = 'hidden'
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

    const resizeObserver = new ResizeObserver(() => {
      resize()
      schedule()
    })
    resizeObserver.observe(canvas)
    const band = host.querySelector('[data-activity-band]')
    if (band) resizeObserver.observe(band)

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
  const { contributions, prs, documents, since, documentsSince } = SUMMARY
  const parts = [count(contributions, 'contribution'), count(prs, 'pull request')]
  if (documentsSince !== null) {
    parts.push(`${count(documents, 'document')} written with AI agents (since ${withYear(utc(documentsSince))})`)
  }
  parts.push(`since ${withYear(utc(since))}`, `updated ${monthDay(utc(ACTIVITY_GENERATED))}`)
  return <p className="m-0 text-[13px] leading-[1.4] tracking-[-0.2px] text-ink md:text-right">{parts.join(' · ')}</p>
}
