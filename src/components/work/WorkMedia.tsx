import { useEffect, useRef, useState } from 'react'
import type { Media } from '../../content'
import { useReducedMotion } from '../../figures/useFigureInput'

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

function Video({ media, fit }: { media: Media; fit: string }) {
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
      className={`size-full ${fit}`}
    />
  )
}

interface WorkMediaProps {
  media?: Media
  /** shown on the grey placeholder until the file exists */
  label: string
  fit?: 'cover' | 'contain'
  /** the open view's picture loads straight away; cards load as they scroll near */
  eager?: boolean
}

/** A work picture: an image, a looping video, or (until the file exists) a labelled grey box. */
export function WorkMedia({ media, label, fit = 'cover', eager = false }: WorkMediaProps) {
  const fitClass = fit === 'contain' ? 'object-contain' : 'object-cover'

  if (!media) {
    return (
      <div className="flex size-full items-center justify-center bg-[color-mix(in_srgb,var(--ink)_10%,var(--bg))]">
        <span className="font-mono text-xs uppercase tracking-[0.08em] text-muted">{label}</span>
      </div>
    )
  }
  if (media.kind === 'video') return <Video media={media} fit={fitClass} />
  return (
    <img
      src={media.src}
      alt={media.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`size-full ${fitClass}`}
    />
  )
}
