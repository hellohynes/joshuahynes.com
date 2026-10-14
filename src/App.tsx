import { CaseStudy } from './components/CaseStudy'
import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { LinkList } from './components/LinkList'
import { content } from './content'

const sectionLabel = 'font-mono text-xs uppercase tracking-[0.08em] text-muted'

function App() {
  const { name, role, thesis, scope, caseStudies, lab, companies, reading, listening, contact } = content

  return (
    <div id="top" className="mx-auto max-w-[88rem] px-4 sm:px-8">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-bg focus:p-2 focus:font-mono focus:text-xs"
      >
        Skip to content
      </a>
      <Header name={name} />
      <main id="main">
        <Hero role={role} thesis={thesis} scope={scope} />

        <section id="work" aria-labelledby="work-h" className="scroll-mt-4 pb-16">
          <h2 id="work-h" className={`${sectionLabel} pb-6`}>
            Work
          </h2>
          {caseStudies.map((study) => (
            <CaseStudy key={study.id} study={study} />
          ))}
        </section>

        <section id="lab" aria-labelledby="lab-h" className="scroll-mt-4 border-t border-rule py-16">
          <h2 id="lab-h" className={sectionLabel}>
            Lab
          </h2>
          <p className="mt-6 max-w-[24ch] font-serif text-[clamp(1.75rem,3.6vw,3rem)] font-[380] leading-[1.1] tracking-[-0.02em]">
            {lab.title}
          </p>
          <p className="mt-4 max-w-prose text-lg leading-snug">{lab.blurb}</p>
          <a href={lab.href} className="mt-6 inline-block py-1 font-mono text-xs uppercase tracking-[0.08em] underline underline-offset-4 hover:text-accent">
            View
          </a>
        </section>

        <section aria-label="Companies" className="border-t border-rule py-16">
          <LinkList title="Companies" items={companies} />
        </section>

        <section id="reading" aria-label="Reading and listening" className="scroll-mt-4 grid gap-12 border-t border-rule py-16 md:grid-cols-2 md:gap-16">
          <LinkList title="Reading" items={reading} />
          <LinkList title="Listening" items={listening} />
        </section>
      </main>

      <footer id="contact" className="scroll-mt-4 border-t border-rule py-16">
        <h2 className={sectionLabel}>Contact</h2>
        <a href={contact.href} className="mt-6 inline-block py-1 font-serif text-[clamp(1.75rem,4vw,3.5rem)] tracking-[-0.02em] underline decoration-rule underline-offset-8 hover:decoration-accent">
          {contact.label}
        </a>
      </footer>
    </div>
  )
}

export default App
