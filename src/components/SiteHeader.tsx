import { Link } from '../lib/router.tsx'
import { site } from '../content/site.ts'
import { JhGlyph } from './JhGlyph'
import { ThemeToggle } from './ThemeToggle'

const navLink = 'inline-flex h-11 items-center text-ink underline-offset-4 hover:underline aria-[current=page]:underline'

/**
 * The glyph, name and role on the left (name over role below `sm` when `compact`, so the row still fits beside the
 * sections), the sections and the theme toggle on the right. `section` marks the current page; null marks none.
 * `compact` drops the header's own vertical padding so a page can seat it in a corner of the window.
 */
export function SiteHeader({ section, compact = false }: { section: 'work' | 'about' | null; compact?: boolean }) {
  return (
    <header
      className={`flex flex-wrap items-center justify-between gap-x-6 text-[15px] leading-[1.2] tracking-[-0.3px] ${
        compact ? '' : 'py-6 md:py-10'
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-bg focus:p-2 focus:text-xs"
      >
        Skip to content
      </a>
      <Link to="/" className="inline-flex h-11 items-center gap-3 whitespace-nowrap text-ink">
        <JhGlyph className="size-6 shrink-0" />
        <span className={`flex gap-2 ${compact ? 'max-sm:flex-col max-sm:gap-0' : ''}`}>
          <span>{site.name}</span>
          <span>{site.role}</span>
        </span>
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
