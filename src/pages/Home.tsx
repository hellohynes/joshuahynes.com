import { ActivityDrawing, ActivityTotals } from '../components/ActivityDrawing'
import { PageFrame } from '../components/PageFrame'
import { SiteHeader } from '../components/SiteHeader'
import { site } from '../content/site.ts'

const link = 'text-ink underline-offset-4 hover:underline'

export function Home() {
  return (
    <PageFrame>
      <SiteHeader section={null} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col justify-center py-12">
        <h1 className="m-0 text-[15vw] font-medium md:text-[clamp(3rem,11vw,11rem)] leading-[0.9] tracking-[-0.05em] text-ink">
          <span className="block">{site.headline.first}</span>
          <span className="block">{`${site.headline.verbs[0]} ${site.headline.rest}`}</span>
        </h1>
      </main>
      <footer className="flex flex-col gap-3 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-10">
        <p className="m-0 shrink-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">
          <a href={`mailto:${site.contact.email}`} className={link}>
            {site.contact.email}
          </a>
        </p>
        <ActivityTotals />
      </footer>
      <ActivityDrawing />
    </PageFrame>
  )
}
