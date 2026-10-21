import { useEffect } from 'react'
import { Footer } from '../components/Footer'
import { Intro } from '../components/Intro'
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
    <div className="px-[clamp(1.5rem,6.8vw,6rem)]">
      <SiteHeader />
      <main id="main">
        <Intro name={site.name} parts={site.intro} />
        <WorkHistory history={site.history} />
        <section id="contact" tabIndex={-1} aria-label="Contact" className="scroll-mt-6 outline-none">
          <Footer email={site.contact.email} />
        </section>
      </main>
    </div>
  )
}
