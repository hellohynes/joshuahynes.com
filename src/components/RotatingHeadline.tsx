import { useEffect, useLayoutEffect, useRef } from 'react'
import { site } from '../content/site.ts'
import { fitScale } from '../lib/fit.ts'
import { FLIP_FONTS, colorFor, createVerbPicker, type VerbPick } from '../lib/verbs.ts'
import { cellPhase, endCursorVisible, flipDuration } from '../lib/flip.ts'

/** How long a word stays before the next one starts printing in. */
const HOLD_MS = 5000
/** The longest to wait for a typeface before the word prints in the default one instead. */
const FONT_WAIT_MS = 800
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@$?!/<>+=*'

/**
 * Per typeface: size relative to the headline, so each face looks about as large and heavy as the grotesque (the faces
 * differ in x-height and cap height), the weight that is actually loaded, and the tracking (the grotesque's own
 * -0.05em suits no other face).
 */
const FONT_TWEAKS: Record<string, { size: number; weight: number; tracking: string }> = {
  'instrument-serif': { size: 1.02, weight: 400, tracking: '-0.02em' },
  fraunces: { size: 0.98, weight: 500, tracking: '-0.02em' },
  'dm-serif-display': { size: 0.98, weight: 400, tracking: '-0.01em' },
  yellowtail: { size: 1.12, weight: 400, tracking: '0' },
  'jetbrains-mono': { size: 0.86, weight: 500, tracking: '-0.02em' },
  'permanent-marker': { size: 0.9, weight: 400, tracking: '0' },
  bungee: { size: 0.84, weight: 400, tracking: '0' },
  silkscreen: { size: 0.84, weight: 400, tracking: '0' },
}

type Cell = { el: HTMLElement; fin: HTMLElement; fl: HTMLElement; cu: HTMLElement; phase: string; glyph: number }
type Control = { setPaused(paused: boolean): void }

function currentTheme(): 'light' | 'dark' {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * The home headline. Line two's first word changes every few seconds, printed in with the terminal effect from the
 * work page (a block cursor runs across the word leaving spinning glyphs that then lock to the letters) and sometimes
 * in another typeface and colour. The animation is driven imperatively from the DOM, not React state, so a change
 * never re-renders anything.
 *
 * Assistive technology gets one static sentence; the visual headline is hidden from it, so the changing word is never
 * announced. Nothing changes under reduced motion, while `paused`, or while the tab is hidden.
 */
export function RotatingHeadline({ paused }: { paused: boolean }) {
  const lineRef = useRef<HTMLSpanElement>(null)
  const innerRef = useRef<HTMLSpanElement>(null)
  const verbRef = useRef<HTMLSpanElement>(null)
  const controlRef = useRef<Control | null>(null)
  const { first, verbs, rest } = site.headline

  useLayoutEffect(() => {
    const line = lineRef.current
    const inner = innerRef.current
    const verbEl = verbRef.current
    if (!line || !inner || !verbEl) return

    const reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const schemeQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const picker = createVerbPicker(verbs, Math.random)
    let current: VerbPick = picker.next()
    let reduced = reducedQuery.matches
    let userPaused = false
    let hidden = document.hidden
    let disposed = false
    let printing = false
    let holdTimer: number | undefined
    let fontTimer: number | undefined
    let raf = 0
    let ticket = 0
    let settle: (() => void) | null = null

    // Start from the plain first word, whatever an earlier run of this effect left behind.
    verbEl.textContent = current.verb
    verbEl.removeAttribute('style')

    function applyColor() {
      verbEl!.style.color = colorFor(current.color, currentTheme()) ?? ''
    }

    function applyFit() {
      const natural = inner!.offsetWidth
      const scale = fitScale(line!.getBoundingClientRect().width, natural)
      inner!.style.transform = scale === 1 ? '' : `scale(${scale})`
    }

    function buildCells(pick: VerbPick, useFont: boolean): Cell[] {
      const font = useFont ? FLIP_FONTS.find((f) => f.key === pick.font) : undefined
      const tweak = font ? FONT_TWEAKS[font.key] : undefined
      verbEl!.replaceChildren()
      verbEl!.removeAttribute('style')
      if (font && tweak) {
        verbEl!.style.fontFamily = font.family
        verbEl!.style.fontSize = `${tweak.size}em`
        verbEl!.style.fontWeight = String(tweak.weight)
        verbEl!.style.letterSpacing = tweak.tracking
      }
      applyColor()

      const cells: Cell[] = []
      for (const char of pick.verb) {
        if (char === ' ') {
          verbEl!.append(' ')
          continue
        }
        const el = document.createElement('span')
        el.className = 'rh-ch'
        el.innerHTML = '<span class="rh-fin"></span><span class="rh-fl"></span><span class="rh-cu"></span>'
        const [fin, fl, cu] = Array.from(el.children) as HTMLElement[]
        fin.textContent = char
        verbEl!.append(el)
        cells.push({ el, fin, fl, cu, phase: '', glyph: -1 })
      }

      // Pin every cell to its final glyph's width (reads first, then writes), so nothing shifts as letters lock in.
      const widths = cells.map((c) => c.fin.getBoundingClientRect().width)
      cells.forEach((c, i) => {
        c.el.style.width = `${widths[i]}px`
      })
      // Where the baseline sits in a cell, which varies with the face: the cursor and spinner are placed from it.
      if (cells.length > 0) {
        const probe = document.createElement('i')
        probe.className = 'rh-probe'
        cells[0].fin.append(probe)
        const baseline = probe.getBoundingClientRect().bottom - cells[0].el.getBoundingClientRect().top
        probe.remove()
        verbEl!.style.setProperty('--bl', `${baseline}px`)
      }
      const end = document.createElement('span')
      end.className = 'rh-end'
      cells[cells.length - 1]?.el.append(end)
      return cells
    }

    function render(cells: Cell[], t: number) {
      cells.forEach((c, i) => {
        const { phase, glyph } = cellPhase(t, i, POOL.length)
        if (phase !== c.phase) {
          c.phase = phase
          c.fin.style.opacity = phase === 'locked' ? '1' : '0'
          c.cu.style.opacity = phase === 'cursor' ? '1' : '0'
          c.fl.style.opacity = phase === 'spin' ? '1' : '0'
        }
        if (phase === 'spin' && glyph !== c.glyph) {
          c.glyph = glyph
          c.fl.textContent = POOL[glyph]
        }
      })
      const end = cells[cells.length - 1]?.el.querySelector<HTMLElement>('.rh-end')
      if (end) end.style.opacity = endCursorVisible(t, cells.length) ? '1' : '0'
    }

    function clearHold() {
      window.clearTimeout(holdTimer)
      holdTimer = undefined
    }

    function schedule() {
      clearHold()
      if (disposed || printing || reduced || hidden || userPaused) return
      holdTimer = window.setTimeout(change, HOLD_MS)
    }

    /** Resolves true when the face is ready; false on failure, no matching face, or after FONT_WAIT_MS. */
    async function loadFace(pick: VerbPick): Promise<boolean> {
      const font = FLIP_FONTS.find((f) => f.key === pick.font)
      const tweak = font && FONT_TWEAKS[font.key]
      if (!font || !tweak) return false
      const timeout = new Promise<null>((resolve) => {
        fontTimer = window.setTimeout(() => resolve(null), FONT_WAIT_MS)
      })
      try {
        const faces = await Promise.race([document.fonts.load(`${tweak.weight} 1em ${font.family}`, pick.verb), timeout])
        return faces !== null && faces.length > 0
      } catch {
        return false
      } finally {
        window.clearTimeout(fontTimer)
        fontTimer = undefined
      }
    }

    async function change() {
      holdTimer = undefined
      if (disposed || printing) return
      const pick = picker.next()
      const mine = ++ticket
      printing = true
      const useFont = pick.font !== null ? await loadFace(pick) : false
      if (disposed || mine !== ticket) return

      current = useFont ? pick : { ...pick, font: null }
      const cells = buildCells(current, useFont)
      applyFit()
      const duration = flipDuration(cells.length)
      let start: number | null = null
      render(cells, 0)

      const done = () => {
        settle = null
        printing = false
        schedule()
      }
      settle = () => {
        cancelAnimationFrame(raf)
        render(cells, duration)
        done()
      }
      const frame = (now: number) => {
        start ??= now
        const t = now - start
        if (t >= duration) {
          settle?.()
          return
        }
        render(cells, t)
        raf = requestAnimationFrame(frame)
      }
      raf = requestAnimationFrame(frame)
    }

    // Stop whatever is in flight: finish a print at once, or drop a word still waiting on its typeface.
    function interrupt() {
      clearHold()
      if (settle) settle()
      else if (printing) {
        ticket++
        window.clearTimeout(fontTimer)
        fontTimer = undefined
        printing = false
      }
    }

    function onVisibility() {
      hidden = document.hidden
      schedule()
    }
    function onReduced() {
      reduced = reducedQuery.matches
      if (reduced) interrupt()
      else schedule()
    }

    const resize = new ResizeObserver(applyFit)
    resize.observe(line)
    const themeObserver = new MutationObserver(applyColor)
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })
    schemeQuery.addEventListener('change', applyColor)
    reducedQuery.addEventListener('change', onReduced)
    document.addEventListener('visibilitychange', onVisibility)

    applyFit()
    schedule()

    controlRef.current = {
      setPaused(next) {
        if (next === userPaused) return
        userPaused = next
        // Pausing lets a print in progress finish, but starts nothing new; resuming restarts the hold.
        if (next) clearHold()
        else schedule()
      },
    }

    return () => {
      disposed = true
      ticket++
      controlRef.current = null
      window.clearTimeout(holdTimer)
      window.clearTimeout(fontTimer)
      cancelAnimationFrame(raf)
      resize.disconnect()
      themeObserver.disconnect()
      schemeQuery.removeEventListener('change', applyColor)
      reducedQuery.removeEventListener('change', onReduced)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [verbs])

  useEffect(() => {
    controlRef.current?.setPaused(paused)
  }, [paused])

  return (
    <h1 className="m-0 text-[15vw] font-medium md:text-[clamp(3rem,11vw,11rem)] leading-[0.9] tracking-[-0.05em] text-ink">
      <span className="sr-only">{`${first} ${verbs[0]} ${rest}`}</span>
      <span aria-hidden="true">
        <span className="block">{first}</span>
        <span ref={lineRef} className="rh-line">
          <span ref={innerRef} className="rh-inner">
            <span ref={verbRef} className="rh-verb">
              {verbs[0]}
            </span>{' '}
            {rest}
          </span>
        </span>
      </span>
    </h1>
  )
}
