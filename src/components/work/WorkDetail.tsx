import { useEffect, useRef } from 'react'
import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import type { WorkItem } from '../../content'
import { WorkMedia } from './WorkMedia'

const label = 'font-mono text-xs uppercase tracking-[0.08em] text-muted'

/**
 * A piece of work, full page. On a wide screen the picture fills the left and stays put, and the drawer on the
 * right is the part that scrolls. On a phone they stack, the picture on top and the text below, and the whole
 * page scrolls. Escape, the Close button and the Back button all close it.
 */
export function WorkDetail({ item, onClose }: { item: WorkItem; onClose: () => void }) {
  const closeButton = useRef<HTMLButtonElement>(null)

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
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="work-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-bg text-ink lg:overflow-hidden"
    >
      <button
        ref={closeButton}
        type="button"
        onClick={onClose}
        className="fixed right-4 top-4 z-10 cursor-pointer border border-rule bg-bg px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] hover:border-ink"
      >
        Close
      </button>

      <div className="grid min-h-full lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(24rem,32rem)]">
        <div
          className="work-detail-media relative aspect-(--ratio) max-h-[75dvh] overflow-hidden lg:aspect-auto lg:h-full lg:max-h-none"
          style={{ '--ratio': item.ratio } as CSSProperties}
        >
          <WorkMedia media={item.media} fit={item.fit} label={item.title} eager />
        </div>

        <aside className="work-drawer border-t border-rule p-6 sm:p-8 lg:h-full lg:overflow-y-auto lg:border-l lg:border-t-0 lg:pt-20">
          <h2 id="work-title" className="font-serif text-[clamp(1.75rem,2.6vw,3rem)] font-[380] leading-[1.1] tracking-[-0.02em]">
            {item.title}
          </h2>
          <dl className="mt-10 grid gap-8">
            <div className="grid gap-2">
              <dt className={label}>Role</dt>
              <dd className="m-0 text-lg leading-snug">{item.role}</dd>
            </div>
            <div className="grid gap-2">
              <dt className={label}>Time range</dt>
              <dd className="m-0 text-lg leading-snug">{item.period}</dd>
            </div>
            <div className="grid gap-2">
              <dt className={label}>Problem</dt>
              <dd className="m-0 text-lg leading-snug">{item.problem}</dd>
            </div>
            <div className="grid gap-2">
              <dt className={label}>Outcome</dt>
              <dd className="m-0 text-lg leading-snug">{item.outcome}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </div>,
    document.body,
  )
}
