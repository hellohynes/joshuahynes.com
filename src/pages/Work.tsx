import { BELOW_HEADER, PageFrame } from '../components/PageFrame'
import { SiteHeader } from '../components/SiteHeader'
import { WorkCell } from '../components/work/WorkCell'
import { items } from '../content/index.ts'

export function Work() {
  return (
    <PageFrame>
      <SiteHeader section="work" />
      <main id="main" tabIndex={-1} className={`${BELOW_HEADER} pb-16`}>
        <h1 className="sr-only">Work</h1>
        {items.length === 0 ? (
          <p className="m-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">Work is on its way.</p>
        ) : (
          <div className="work-cells">
            <ul className="work-cells-list">
              {items.map((item) => (
                <li key={item.id}>
                  <WorkCell item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </PageFrame>
  )
}
