import { useEffect } from 'react'
import { Intro } from '../components/Intro'
import { BELOW_HEADER, PageFrame } from '../components/PageFrame'
import { SiteFooter } from '../components/SiteFooter'
import { SiteHeader } from '../components/SiteHeader'
import { WorkHistory } from '../components/WorkHistory'
import { site } from '../content/site.ts'

/** A direct load of /about#contact: the browser looks for the target before React has rendered it, so scroll to it once it exists. */
function scrollToHash() {
  let id = location.hash.slice(1)
  try {
    id = decodeURIComponent(id)
  } catch {
    // a malformed escape: look the raw text up instead
  }
  const target = id ? document.getElementById(id) : null
  if (!target) return
  target.scrollIntoView()
  target.focus({ preventScroll: true })
}

export function About() {
  useEffect(scrollToHash, [])

  return (
    <PageFrame>
      <SiteHeader section="about" />
      <main id="main" tabIndex={-1} className={`${BELOW_HEADER} flex-1`}>
        <Intro name={site.name} parts={site.intro} />
        <WorkHistory history={site.history} />
      </main>
      <SiteFooter id="contact" />
    </PageFrame>
  )
}
