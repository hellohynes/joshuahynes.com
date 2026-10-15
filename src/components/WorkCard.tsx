import type { WorkItem } from '../content'
import { WorkMedia } from './work/WorkMedia'

/**
 * One piece of work, as a button that opens it. It is only the picture, so the gaps in the grid stay even:
 * the title and time range appear over the bottom of the picture on hover or keyboard focus, and take no room.
 */
export function WorkCard({ item, index, onOpen }: { item: WorkItem; index: number; onOpen: (id: string) => void }) {
  return (
    <button
      type="button"
      data-work-card={item.id}
      aria-label={`${item.title}, ${item.period}. Open project.`}
      onClick={() => onOpen(item.id)}
      className="group mb-4 block w-full cursor-pointer break-inside-avoid text-left outline-offset-4 focus-visible:outline-2 focus-visible:outline-accent"
    >
      <span data-work-media={item.id} className="relative block overflow-hidden" style={{ aspectRatio: item.ratio }}>
        <WorkMedia media={item.media} fit={item.fit} label={`TODO: Work ${String(index).padStart(2, '0')}`} />
        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-baseline justify-between gap-x-4 bg-bg px-3 py-2 font-mono text-xs uppercase tracking-[0.08em] opacity-0 motion-safe:transition-opacity motion-safe:duration-200 group-hover:opacity-100 group-focus-visible:opacity-100">
          <span className="text-ink">{item.title}</span>
          <span className="text-muted">{item.period}</span>
        </span>
      </span>
    </button>
  )
}
