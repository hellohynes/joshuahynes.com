import { useEffect, useRef } from 'react'
import { ACTIVITY_GENERATED, ACTIVITY_WEEKS } from '../data/activity.ts'
import { summarize } from '../lib/activity.ts'
import { busyScale, hitTest, weekProfile } from '../lib/ridge.ts'

const ROWS = ACTIVITY_WEEKS.length
const SAMPLES = 220
const DRAW_IN_MS = 4000
// The plot as fractions of the canvas, so the lines pass over the headline whatever the viewport.
const PLOT = { left: 0.06, right: 0.94, top: 0.17, bottom: 0.86 }

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

const easeOut = (t: number): number => 1 - (1 - t) ** 3

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
 * The last 80 weeks of activity as stacked lines, one per week, drawn over the positioned parent. Purely decorative:
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

    const animating = (now: number) => !reducedMotion && startedAt !== null && now - startedAt < DRAW_IN_MS

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
      if (width === 0 || height === 0) return

      const x0 = width * PLOT.left
      const x1 = width * PLOT.right
      const top = height * PLOT.top
      const bottom = height * PLOT.bottom
      const rowHeight = (bottom - top) / (ROWS - 1)
      const amplitude = rowHeight * 9
      const shown = rowsShown(now)

      const hit = pointer.inside ? hitTest({ x: pointer.x, y: pointer.y, x0, x1, top, bottom, rows: ROWS }) : null
      const hot = hit && hit.week < shown ? hit : null

      const trace = (week: number, base: number) => {
        ctx.beginPath()
        for (let i = 0; i <= SAMPLES; i++) {
          const u = i / SAMPLES
          const x = x0 + (x1 - x0) * u
          const y = base - PROFILES[week](u) * amplitude
          if (i) ctx.lineTo(x, y)
          else ctx.moveTo(x, y)
        }
      }

      ctx.lineJoin = 'round'
      // Oldest first: each week is filled before it is stroked, so newer weeks hide the older lines behind them.
      for (let week = 0; week < shown; week++) {
        const base = top + week * rowHeight
        const accent = week === ROWS - 1 || week === hot?.week
        trace(week, base)
        ctx.lineTo(x1, base + 1)
        ctx.lineTo(x0, base + 1)
        ctx.closePath()
        ctx.fillStyle = palette.fill
        ctx.fill()
        ctx.strokeStyle = accent ? palette.cobalt : palette.ink
        ctx.lineWidth = accent ? 1.1 : 0.7
        ctx.globalAlpha = accent ? 1 : 0.8
        trace(week, base)
        ctx.stroke()
        ctx.globalAlpha = 1
      }

      if (hot) {
        const week = ACTIVITY_WEEKS[hot.week]
        const u = (hot.day + 0.5) / 7
        const px = x0 + (x1 - x0) * u
        const py = top + hot.week * rowHeight - PROFILES[hot.week](u) * amplitude
        ctx.fillStyle = palette.cobalt
        ctx.beginPath()
        ctx.arc(px, py, 2.4, 0, Math.PI * 2)
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

        const tipWidth = tip.offsetWidth
        const tipHeight = tip.offsetHeight
        const margin = 8
        const right = px + 14
        const left = right + tipWidth > width - margin ? px - 14 - tipWidth : right
        tip.style.left = `${Math.max(margin, left)}px`
        tip.style.top = `${Math.min(height - tipHeight - margin, Math.max(margin, py - tipHeight - 10))}px`
        tip.style.visibility = 'visible'
      } else {
        tip.style.visibility = 'hidden'
      }

      if (animating(now)) schedule()
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
