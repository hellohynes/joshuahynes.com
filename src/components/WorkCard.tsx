import type { CSSProperties } from 'react'
import type { WorkItem } from '../content'
import { WorkMedia } from './work/WorkMedia'

/**
 * One tile in the grid, as a button that opens the piece. It is only the picture, so the gaps stay even: the
 * title and time range appear over the bottom edge on hover or keyboard focus, and take no room.
 */
export function WorkCard({ item, onOpen }: { item: WorkItem; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      data-work-card={item.id}
      aria-label={`${item.title}, ${item.period}. Open project.`}
      onClick={() => onOpen(item.id)}
      style={{ '--cols': item.cols, '--rows': item.rows } as CSSProperties}
      className="work-tile group block size-full cursor-pointer text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span data-work-media={item.id} className="relative block size-full overflow-hidden">
        <WorkMedia media={item.media} fit={item.fit} label={item.title} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-4 bg-bg px-3 py-2 text-xs opacity-0 motion-safe:transition-opacity motion-safe:duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-ink">{item.title}</span>
          <span className="text-muted">{item.period}</span>
        </span>
      </span>
    </button>
  )
}
