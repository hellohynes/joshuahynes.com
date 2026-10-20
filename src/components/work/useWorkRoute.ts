import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useReducedMotion } from '../../figures/useFigureInput'

const HASH = /^#\/work\/([\w-]+)$/
/**
 * Closing takes about 75% of the time opening does (opening is about 530ms: the frame grows in 360ms and the drawer
 * opens from 110ms to 530ms). The drawer retracts for this long, then the frame shrinks for 220ms (index.css); with the view
 * transition's setup that measures at about 75% of the time opening takes (about 385ms against 513ms). For 50%, use about
 * 90 and 130. Keep this equal to the drawer's close duration in WorkDetail.
 */
const DRAWER_CLOSE_MS = 140
const NAME = 'work-frame' // the view-transition name the card carries as it grows into the frame, and back

const readId = (ids: string[]) => {
  const id = HASH.exec(window.location.hash)?.[1]
  return id && ids.includes(id) ? id : null
}
const cardPicture = (id: string) => document.querySelector<HTMLElement>(`[data-work-media="${id}"]`)

/**
 * Which piece of work is open. It lives in the URL (#/work/<id>) so a piece can be linked to and the Back
 * button closes it. Where the browser supports view transitions, the card grows into the frame on open and shrinks
 * back into its card on close. Closing runs the opening backwards: on a wide screen the drawer retracts first
 * (`closing` is true meanwhile), then the frame shrinks into its card.
 */
export function useWorkRoute(ids: string[]) {
  const reduced = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(() => readId(ids))
  const [closing, setClosing] = useState(false)
  const current = useRef(openId)
  const retracting = useRef(false)
  const retractTimer = useRef(0)

  useEffect(() => () => window.clearTimeout(retractTimer.current), [])

  const swap = useCallback(
    (next: string | null) => {
      const prev = current.current
      if (prev === next) return
      const apply = () =>
        flushSync(() => {
          current.current = next
          retracting.current = false
          setOpenId(next)
          setClosing(false)
        })

      if (reduced || typeof document.startViewTransition !== 'function' || (prev && next)) {
        apply()
        return
      }

      // The page behind stays still while the picture moves; index.css reads this to time the rest.
      const root = document.documentElement
      root.dataset.vt = next ? 'open' : 'close'
      const done = (cardId: string) => {
        delete root.dataset.vt
        const card = cardPicture(cardId)
        if (card) card.style.viewTransitionName = ''
      }

      if (next) {
        // Opening: name the card's picture for the "before" snapshot, then hand the name to the open view.
        const card = cardPicture(next)
        if (card) card.style.viewTransitionName = NAME
        const transition = document.startViewTransition(() => {
          if (card) card.style.viewTransitionName = ''
          apply()
        })
        void transition.finished.finally(() => done(next))
      } else if (prev) {
        // Closing: the open view carries the name; give it to the card once it is back in the page.
        const transition = document.startViewTransition(() => {
          apply()
          const card = cardPicture(prev)
          if (card) card.style.viewTransitionName = NAME
        })
        void transition.finished.finally(() => done(prev))
      }
    },
    [reduced],
  )

  const show = useCallback(
    (next: string | null) => {
      if (current.current === next) return
      if (next) {
        // Opening (or going straight to another piece): drop any retract that was under way.
        window.clearTimeout(retractTimer.current)
        retracting.current = false
        setClosing(false)
        swap(next)
        return
      }
      if (retracting.current) return
      const wide = window.matchMedia('(min-width: 64rem)').matches
      if (reduced || !wide || typeof document.startViewTransition !== 'function') {
        swap(null)
        return
      }
      // Wide screen: retract the drawer in the live page first, then shrink the frame into its card.
      retracting.current = true
      setClosing(true)
      retractTimer.current = window.setTimeout(() => swap(null), DRAWER_CLOSE_MS)
    },
    [reduced, swap],
  )

  const open = useCallback(
    (id: string) => {
      window.history.pushState({ work: true }, '', `#/work/${id}`)
      show(id)
    },
    [show],
  )

  const close = useCallback(() => {
    if ((window.history.state as { work?: boolean } | null)?.work) {
      window.history.back() // the popstate below closes it
    } else {
      // Arrived on a direct link: there is nothing to go back to, so just clear the address.
      window.history.replaceState(null, '', window.location.pathname + window.location.search)
      show(null)
    }
  }, [show])

  useEffect(() => {
    const onPop = () => show(readId(ids))
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [ids, show])

  return { openId, closing, open, close }
}
