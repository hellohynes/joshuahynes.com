import { useMemo } from 'react'
import type { WorkItem } from '../content'
import { WorkCard } from './WorkCard'
import { WorkDetail } from './work/WorkDetail'
import { useWorkRoute } from './work/useWorkRoute'

/**
 * A masonry grid of the work. CSS columns do the packing, so there is no layout script: cards of different
 * heights stack down each column, and the column count follows the screen. Opening a card shows that piece full page.
 */
export function WorkGrid({ work }: { work: WorkItem[] }) {
  const ids = useMemo(() => work.map((item) => item.id), [work])
  const { openId, open, close } = useWorkRoute(ids)
  const openItem = work.find((item) => item.id === openId)

  return (
    <section id="work" aria-labelledby="work-h" className="scroll-mt-4 pb-16 pt-16">
      <h2 id="work-h" className="pb-6 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        Work
      </h2>
      <div className="columns-1 gap-4 sm:columns-2 lg:columns-3">
        {work.map((item, i) => (
          <WorkCard key={item.id} item={item} index={i + 1} onOpen={open} />
        ))}
      </div>
      {openItem && <WorkDetail item={openItem} onClose={close} />}
    </section>
  )
}
