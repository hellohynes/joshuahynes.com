import { Link } from '../lib/router.tsx'
import { site } from '../content/site.ts'
import { ThemeToggle } from './ThemeToggle'

const navLink = 'inline-flex h-11 items-center text-ink underline-offset-4 hover:underline aria-[current=page]:underline'

/** Name and role on the left as one line, the sections and the theme toggle on the right. `section` marks the current page; null marks none. */
export function SiteHeader({ section }: { section: 'work' | 'about' | null }) {
  return (
    <header className="flex flex-wrap items-center justify-between gap-x-6 py-6 text-[15px] leading-[1.2] tracking-[-0.3px] md:py-10">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-bg focus:p-2 focus:text-xs"
      >
        Skip to content
      </a>
      <Link to="/" className="inline-flex h-11 items-center gap-2 whitespace-nowrap text-ink">
        <span>{site.name}</span>
        <span>{site.role}</span>
      </Link>
      <div className="flex items-center gap-5">
        <nav aria-label="Main" className="flex items-center gap-5">
          <Link to="/work" className={navLink} aria-current={section === 'work' ? 'page' : undefined}>
            Work
          </Link>
          <Link to="/about" className={navLink} aria-current={section === 'about' ? 'page' : undefined}>
            About
          </Link>
        </nav>
        <ThemeToggle />
      </div>
    </header>
  )
}
