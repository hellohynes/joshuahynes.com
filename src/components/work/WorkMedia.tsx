import { useEffect, useRef, useState } from 'react'
import type { Media } from '../../content/types.ts'
import { useReducedMotion } from '../../figures/useFigureInput'
import { assetUrl } from '../../lib/assets.ts'
import { readableText } from '../../lib/color.ts'

const BASE = import.meta.env.BASE_URL

/** The box a work picture shows until its file exists. */
const PLACEHOLDER_BG = '#4a4a4a'

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
      src={assetUrl(media.src, BASE)}
      poster={media.poster && assetUrl(media.poster, BASE)}
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
  /** shown on the grey placeholder until the file exists (the piece's title) */
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
      <div className="flex size-full items-center justify-center" style={{ backgroundColor: PLACEHOLDER_BG }}>
        {/* derived from the box, not the muted grey, which is too low-contrast on it in both themes */}
        <span className="text-xl" style={{ color: readableText(PLACEHOLDER_BG) }}>
          {label}
        </span>
      </div>
    )
  }
  if (media.kind === 'video') return <Video media={media} fit={fitClass} />
  return (
    <img
      src={assetUrl(media.src, BASE)}
      alt={media.alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      className={`size-full ${fitClass}`}
    />
  )
}
