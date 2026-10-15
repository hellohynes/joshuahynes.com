import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { useReducedMotion } from '../../figures/useFigureInput'

const HASH = /^#\/work\/([\w-]+)$/
const NAME = 'work-media' // the view-transition name the picture carries as it moves between card and page

const readId = (ids: string[]) => {
  const id = HASH.exec(window.location.hash)?.[1]
  return id && ids.includes(id) ? id : null
}
const cardPicture = (id: string) => document.querySelector<HTMLElement>(`[data-work-media="${id}"]`)

/**
 * Which piece of work is open. It lives in the URL (#/work/<id>) so a piece can be linked to and the Back
 * button closes it. Where the browser supports view transitions, the picture grows from its card to fill the
 * page on open, and shrinks back into the card on close.
 */
export function useWorkRoute(ids: string[]) {
  const reduced = useReducedMotion()
  const [openId, setOpenId] = useState<string | null>(() => readId(ids))
  const current = useRef(openId)

  const show = useCallback(
    (next: string | null) => {
      const prev = current.current
      if (prev === next) return
      const apply = () =>
        flushSync(() => {
          current.current = next
          setOpenId(next)
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

  return { openId, open, close }
}
