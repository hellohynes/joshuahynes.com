import type { WorkItem } from '../content'
import { WorkCard } from './WorkCard'

/**
 * A masonry grid of the work. CSS columns do the packing, so there is no layout script: cards of different
 * heights stack down each column, and the column count follows the screen.
 */
export function WorkGrid({ work }: { work: WorkItem[] }) {
  return (
    <section id="work" aria-labelledby="work-h" className="scroll-mt-4 pb-16 pt-16">
      <h2 id="work-h" className="pb-6 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        Work
      </h2>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {work.map((item, i) => (
          <WorkCard key={item.id} item={item} index={i + 1} />
        ))}
      </div>
    </section>
  )
}
