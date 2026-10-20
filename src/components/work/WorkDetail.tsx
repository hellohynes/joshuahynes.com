import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { WorkItem } from '../../content'
import { WorkMedia } from './WorkMedia'

const label = 'text-xs leading-[1.6] text-muted'

/** How long after the frame appears the drawer starts to slide in and push the picture over. */
const DRAWER_DELAY_MS = 110

/**
 * A piece of work in a frame set 32px in from the edges of the page, over a dimmed and shadowed backdrop.
 * The picture fills the frame, then the drawer slides in from the right and pushes it narrower. On a wide
 * screen the picture stays put and the drawer is the part that scrolls. On a phone they stack, the picture on
 * top and the text below, and the frame scrolls as one. Escape, the Close button, a click on the backdrop and
 * the Back button all close it. Closing runs the opening backwards: `closing` retracts the drawer first.
 */
export function WorkDetail({ item, closing, onClose }: { item: WorkItem; closing: boolean; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null)
  const [pushed, setPushed] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setPushed(true), DRAWER_DELAY_MS)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const root = document.getElementById('root')
    root?.setAttribute('inert', '') // everything behind it is out of reach of the keyboard and screen readers
    document.documentElement.style.overflow = 'hidden'
    closeButton.current?.focus({ preventScroll: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      window.removeEventListener('keydown', onKey)
      root?.removeAttribute('inert')
      document.documentElement.style.overflow = ''
      document.querySelector<HTMLElement>(`[data-work-card="${item.id}"]`)?.focus({ preventScroll: true })
    }
  }, [item.id, onClose])

  return createPortal(
    <>
      {/* The backdrop: the page stays visible behind it, dimmed. A click on it closes the piece. */}
      <div aria-hidden="true" onClick={onClose} className="fixed inset-0 z-40 bg-black/50" />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="work-title"
        className="work-frame fixed inset-4 z-50 overflow-y-auto bg-bg text-ink shadow-[0_32px_96px_-8px_rgb(0_0_0/0.5)] sm:inset-8 lg:overflow-hidden"
      >
        <button
          ref={closeButton}
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 z-10 cursor-pointer border border-rule bg-bg px-3 py-2 text-xs hover:border-ink"
        >
          Close
        </button>

        {/* On a wide screen the drawer column opens from nothing to 30rem, which is what pushes the picture over. */}
        <div
          data-pushed={pushed && !closing ? '' : undefined}
          className="grid min-h-full lg:h-full lg:grid-cols-[minmax(0,1fr)_0px] lg:transition-[grid-template-columns] lg:duration-[140ms] lg:ease-[cubic-bezier(0.2,0,0,1)] lg:data-[pushed]:grid-cols-[minmax(0,1fr)_30rem] lg:data-[pushed]:duration-[420ms] motion-reduce:transition-none"
        >
          <div
            className="relative aspect-(--ratio) max-h-[75dvh] overflow-hidden lg:aspect-auto lg:h-full lg:max-h-none"
            style={{ '--ratio': item.cols / (item.rows * 0.736) } as CSSProperties}
          >
            <WorkMedia media={item.media} fit={item.fit} label={item.title} eager />
          </div>

          {/* The column clips the drawer as it opens; the drawer itself keeps its width and sits against the right edge. */}
          <div className="lg:min-h-0 lg:overflow-hidden">
            <aside className="border-t border-rule p-6 sm:p-8 lg:ml-auto lg:h-full lg:w-[30rem] lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pt-20">
              <h2 id="work-title" className="text-[clamp(1.5rem,2.2vw,1.875rem)] leading-[1.2] text-ink">
                {item.title}
              </h2>
              <dl className="mt-10 grid gap-8">
                <div className="grid gap-2">
                  <dt className={label}>Role</dt>
                  <dd className="m-0 text-xl leading-[1.35] text-ink">{item.role}</dd>
                </div>
                <div className="grid gap-2">
                  <dt className={label}>Time range</dt>
                  <dd className="m-0 text-xl leading-[1.35] text-ink">{item.period}</dd>
                </div>
                <div className="grid gap-2">
                  <dt className={label}>Problem</dt>
                  <dd className="m-0 text-xl leading-[1.35] text-ink">{item.problem}</dd>
                </div>
                <div className="grid gap-2">
                  <dt className={label}>Outcome</dt>
                  <dd className="m-0 text-xl leading-[1.35] text-ink">{item.outcome}</dd>
                </div>
              </dl>
            </aside>
          </div>
        </div>
      </div>
    </>,
    document.body,
  )
}
