import { useMemo } from 'react'
import type { WorkItem } from '../content'
import { WorkCard } from './WorkCard'
import { WorkDetail } from './work/WorkDetail'
import { useWorkRoute } from './work/useWorkRoute'

/**
 * The work, as a grid of tiles. Each piece says how many of the grid's 8 columns and how many rows it takes up
 * (in content.ts), so tiles can be wide, tall or small; the layout rules are in index.css. Opening a tile
 * shows that piece full page.
 */
export function WorkGrid({ work }: { work: WorkItem[] }) {
  const ids = useMemo(() => work.map((item) => item.id), [work])
  const { openId, closing, open, close } = useWorkRoute(ids)
  const openItem = work.find((item) => item.id === openId)

  return (
    <section id="work" aria-labelledby="work-h" className="scroll-mt-4">
      <h2 id="work-h" className="sr-only">
        Work
      </h2>
      <div className="work-grid-wrap">
        <div className="work-grid">
          {work.map((item) => (
            <WorkCard key={item.id} item={item} onOpen={open} />
          ))}
        </div>
      </div>
      {openItem && <WorkDetail item={openItem} closing={closing} onClose={close} />}
    </section>
  )
}
