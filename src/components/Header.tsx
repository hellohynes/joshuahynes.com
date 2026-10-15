import mark from '../assets/logo-mark.svg'
import wordmark from '../assets/logo-wordmark.svg'
import { ThemeToggle } from './ThemeToggle'

const LINKS = [
  { href: '#work', label: 'Work' },
  { href: '#reading', label: 'Reading' },
  { href: '#contact', label: 'Contact' },
]

export function Header({ name }: { name: string }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3 border-b border-rule py-5">
      <a href="#top" className="inline-flex items-center gap-3 py-1">
        {/* Both files are near-black; index.css inverts them in dark mode. The wordmark is hidden on narrow screens. */}
        <img src={mark} alt={name} width={36} height={36} className="logo block size-9" />
        <img src={wordmark} alt="" width={178} height={14} className="logo hidden h-3.5 w-auto sm:block" />
      </a>
      <nav aria-label="Sections" className="flex items-center gap-6 font-mono text-xs uppercase tracking-[0.08em] text-muted">
        {LINKS.map((l) => (
          <a key={l.href} href={l.href} className="inline-block py-1 hover:text-ink">
            {l.label}
          </a>
        ))}
        <ThemeToggle />
      </nav>
    </header>
  )
}
