import { useState } from 'react'
import { ActivityDrawing, ActivityTotals } from '../components/ActivityDrawing'
import { PageFrame } from '../components/PageFrame'
import { RotatingHeadline } from '../components/RotatingHeadline'
import { SiteHeader } from '../components/SiteHeader'
import { site } from '../content/site.ts'
import { useReducedMotion } from '../lib/useReducedMotion.ts'

const link = 'text-ink underline-offset-4 hover:underline'

export function Home() {
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <PageFrame>
      <SiteHeader section={null} />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col justify-center py-12">
        <RotatingHeadline paused={paused} />
      </main>
      <footer className="flex flex-col gap-3 pt-6 md:flex-row md:items-baseline md:justify-between md:gap-10">
        <div className="flex shrink-0 flex-col items-start gap-1 md:flex-row md:items-baseline md:gap-8">
          <p className="m-0 text-[15px] leading-[1.2] tracking-[-0.3px] text-muted">
            <a href={`mailto:${site.contact.email}`} className={link}>
              {site.contact.email}
            </a>
          </p>
          {/* Nothing moves under reduced motion, so there is nothing to pause. */}
          {!reducedMotion && (
            <button
              type="button"
              onClick={() => setPaused((p) => !p)}
              className="cursor-pointer py-1 text-[15px] leading-[1.2] tracking-[-0.3px] text-ink underline-offset-4 hover:underline"
            >
              {paused ? 'Resume word changes' : 'Pause word changes'}
            </button>
          )}
        </div>
        <ActivityTotals />
      </footer>
      <ActivityDrawing />
    </PageFrame>
  )
}
