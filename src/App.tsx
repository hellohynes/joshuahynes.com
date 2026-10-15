import { Header } from './components/Header'
import { Intro } from './components/Intro'
import { LinkList } from './components/LinkList'
import { OffTheClock } from './components/OffTheClock'
import { WorkGrid } from './components/WorkGrid'
import { content } from './content'

const sectionLabel = 'font-mono text-xs uppercase tracking-[0.08em] text-muted'

function App() {
  const { name, current, earlier, work, reading, listening, contact } = content

  return (
    <div id="top" className="px-4 sm:px-8 lg:px-12">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:bg-bg focus:p-2 focus:font-mono focus:text-xs"
      >
        Skip to content
      </a>
      <Header name={name} />
      <main id="main">
        <Intro current={current} earlier={earlier} />
        <WorkGrid work={work} />
        <OffTheClock />

        <section id="reading" aria-label="Reading and listening" className="scroll-mt-4 grid gap-12 border-t border-rule py-16 md:grid-cols-2 md:gap-16">
          <LinkList title="Reading" items={reading} />
          <LinkList title="Listening" items={listening} />
        </section>
      </main>

      <footer id="contact" className="scroll-mt-4 border-t border-rule py-16">
        <h2 className={sectionLabel}>Contact</h2>
        <a href={contact.href} className="mt-6 inline-block py-1 font-serif text-[clamp(1.75rem,4vw,6rem)] tracking-[-0.02em] underline decoration-rule underline-offset-8 hover:decoration-accent">
          {contact.label}
        </a>
      </footer>
    </div>
  )
}

export default App
