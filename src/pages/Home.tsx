import { useState } from 'react'
import { ActivityDrawing } from '../components/ActivityDrawing'
import { PageFrame } from '../components/PageFrame'
import { RotatingHeadline } from '../components/RotatingHeadline'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { useReducedMotion } from '../lib/useReducedMotion.ts'

export function Home() {
  const [paused, setPaused] = useState(false)
  const reducedMotion = useReducedMotion()

  return (
    <PageFrame>
      <SiteHeader section="home" />
      <main id="main" tabIndex={-1} className="flex flex-1 flex-col justify-center py-12">
        <RotatingHeadline paused={paused} />
      </main>
      <SiteFooter>
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
      </SiteFooter>
      <ActivityDrawing />
    </PageFrame>
  )
}
