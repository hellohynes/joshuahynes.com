import { useEffect, useRef, useState } from 'react'
import type { Media, WorkItem } from '../content'
import { useReducedMotion } from '../figures/useFigureInput'

/** Whether the element is on screen right now (not just once), so a video can pause when scrolled away. */
function useOnScreen<T extends Element>() {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { threshold: 0.25 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return [ref, visible] as const
}

function Video({ media }: { media: Media }) {
  const [ref, visible] = useOnScreen<HTMLVideoElement>()
  const reduced = useReducedMotion()

  useEffect(() => {
    const video = ref.current
    if (!video || reduced) return
    if (visible) void video.play().catch(() => undefined) // a blocked autoplay just leaves the poster showing
    else video.pause()
  }, [visible, reduced, ref])

  return (
    <video
      ref={ref}
      src={media.src}
      poster={media.poster}
      aria-label={media.alt}
      muted
      loop
      playsInline
      preload="none"
      className="size-full object-cover"
    />
  )
}

function WorkMedia({ media, index }: { media?: Media; index: number }) {
  if (!media) {
    return (
      <div className="flex size-full items-center justify-center bg-ink/10">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">TODO: Work {String(index).padStart(2, '0')}</span>
      </div>
    )
  }
  if (media.kind === 'video') return <Video media={media} />
  return <img src={media.src} alt={media.alt} loading="lazy" decoding="async" className="size-full object-cover" />
}

/**
 * One piece of work. The picture comes first and carries the card. The title, year and your part in it sit
 * under it and appear on hover or keyboard focus, and are always shown on screens that cannot hover.
 */
export function WorkCard({ item, index }: { item: WorkItem; index: number }) {
  return (
    <figure
      tabIndex={0}
      className="group mb-4 break-inside-avoid outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <div className="overflow-hidden" style={{ aspectRatio: item.ratio }}>
        <WorkMedia media={item.media} index={index} />
      </div>
      <figcaption className="mt-2 flex flex-wrap items-baseline justify-between gap-x-4 font-mono text-xs uppercase tracking-[0.08em] text-muted opacity-0 motion-safe:transition-opacity motion-safe:duration-200 group-focus-within:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100">
        <span className="text-ink">{item.title}</span>
        <span>
          {item.year} · {item.involvement}
        </span>
      </figcaption>
    </figure>
  )
}
