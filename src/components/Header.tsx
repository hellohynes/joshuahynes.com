import { JhGlyph } from './JhGlyph'
import { ThemeToggle } from './ThemeToggle'

/** The glyph on the left, set 64px down from the top and 64px above the intro, as in the design; the theme toggle on the right. */
export function Header({ name }: { name: string }) {
  return (
    <header className="flex items-center justify-between py-16">
      <a href="#top" aria-label={name} className="inline-flex h-11 items-center">
        <JhGlyph className="size-9" />
      </a>
      <ThemeToggle />
    </header>
  )
}
